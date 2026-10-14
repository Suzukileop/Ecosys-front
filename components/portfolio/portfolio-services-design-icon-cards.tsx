'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { ProfileServiceItem } from '@/types/profile';
import { featuredFill, pickContrastInk, readableInk, withAlpha } from '@/components/portfolio/portfolio-services-pricing-shared';
import { resolveHeroPaletteColor, type HeroPaletteTokenId } from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_SERVICES_PALETTE, mergeServicesPalette } from '@/components/portfolio/portfolio-services-palette-settings';
import { useServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-runtime';
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
import { ServiceIcon, resolveServiceIconKey } from '@/components/portfolio/portfolio-services-icon-cards-icons';
import {
  DEFAULT_SERVICES_ICON_CARDS_SETTINGS,
  type PortfolioServicesIconCardsIconSize,
  type PortfolioServicesIconCardsTasksStyle,
  type PortfolioServicesIconCardsStyle,
  type PortfolioServicesMediaColumnsGap,
  type PortfolioServicesMediaColumnsRadius,
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

const RADIUS: Record<PortfolioServicesMediaColumnsRadius, string> = {
  none: '0px',
  small: '8px',
  medium: '14px',
  large: '22px',
  round: '36px',
};

const GAP_PX: Record<PortfolioServicesMediaColumnsGap, number> = {
  tight: 12,
  normal: 24,
  wide: 36,
  roomy: 52,
};

/** Badge diameter and glyph size in px. */
const ICON_SIZE: Record<PortfolioServicesIconCardsIconSize, { badge: number; glyph: number }> = {
  small: { badge: 32, glyph: 16 },
  medium: { badge: 40, glyph: 20 },
  large: { badge: 56, glyph: 26 },
};

/** Multicolor rotation — the four colours of the reference first (teal, crimson, navy, yellow). */
const MULTICOLOR = ['#14b8a6', '#e11d48', '#1e40af', '#facc15', '#7c3aed', '#f97316', '#0ea5e9', '#16a34a'];

const FONT = (rem: number) => `calc(${rem}rem * var(--pf-services-font-scale, 1))`;

function cardSurface(style: PortfolioServicesIconCardsStyle, isLight: boolean): CSSProperties {
  switch (style) {
    case 'elevated':
      return isLight
        ? {
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 12px 40px -14px rgba(15,23,42,0.14)',
          }
        : {
            backgroundColor: '#161616',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 18px 44px -18px rgba(0,0,0,0.7)',
          };
    case 'outlined':
      return { boxShadow: `inset 0 0 0 1px ${isLight ? 'rgba(10,10,10,0.12)' : 'rgba(255,255,255,0.14)'}` };
    case 'tinted':
      return { backgroundColor: 'color-mix(in srgb, var(--ic-accent) 7%, transparent)' };
    default:
      return {};
  }
}

/** A card's task list in one of four layouts. Checklist and Ruled list always stack one task per
 *  line (they read as a list, never as a wrapped paragraph); Tags and Inline wrap. */
function IconCardTasks({
  tasks,
  layout,
  centered,
  ink,
  isLight,
  markColor,
  label,
}: {
  tasks: string[];
  layout: PortfolioServicesIconCardsTasksStyle;
  centered: boolean;
  ink: string;
  isLight: boolean;
  markColor: string;
  label: string;
}) {
  const t = useT();
  if (layout === 'tags') {
    return (
      <ul className={`mt-5 flex flex-wrap gap-1.5 ${centered ? 'justify-center' : 'justify-start'}`} aria-label={label}>
        {tasks.map((task, taskIndex) => (
          <li
            key={`${task}-${taskIndex}`}
            className="rounded-full px-3 py-1 font-medium text-[color:var(--ic-muted)]"
            style={{
              fontSize: FONT(0.75),
              backgroundColor: `color-mix(in srgb, ${ink} ${isLight ? 5 : 9}%, transparent)`,
            }}
          >
            {task}
          </li>
        ))}
      </ul>
    );
  }
  if (layout === 'inline') {
    return (
      <p
        className={`mt-4 max-w-[34rem] leading-[1.7] text-[color:var(--ic-muted)] ${centered ? 'mx-auto' : ''}`}
        style={{ fontSize: FONT(0.8) }}
        aria-label={label}
      >
        {tasks.map((task, taskIndex) => (
          <span key={`${task}-${taskIndex}`}>
            {taskIndex > 0 ? (
              <span aria-hidden className="mx-2" style={{ color: markColor }}>
                {'&bull;'}
              </span>
            ) : null}
            {task}
          </span>
        ))}
      </p>
    );
  }
  if (layout === 'list') {
    return (
      <ul className="mt-5 w-full max-w-[22rem] text-left" aria-label={label}>
        {tasks.map((task, taskIndex) => (
          <li
            key={`${task}-${taskIndex}`}
            className="flex items-baseline gap-3 border-t py-2.5 last:border-b"
            style={{ fontSize: FONT(0.82), borderColor: `color-mix(in srgb, ${ink} ${isLight ? 10 : 16}%, transparent)` }}
          >
            <span className="w-5 shrink-0 font-mono tabular-nums text-[color:var(--ic-muted)]" style={{ fontSize: FONT(0.68) }}>
              {String(taskIndex + 1).padStart(2, '0')}
            </span>
            <span>{task}</span>
          </li>
        ))}
      </ul>
    );
  }
  // Checklist — a small tinted check in the card's own icon colour before each task.
  return (
    <ul className="mt-5 flex w-full max-w-[22rem] flex-col gap-2.5 text-left" aria-label={label}>
      {tasks.map((task, taskIndex) => (
        <li key={`${task}-${taskIndex}`} className="flex items-start gap-2.5" style={{ fontSize: FONT(0.85) }}>
          <span
            aria-hidden
            className="mt-[0.15em] inline-flex h-[1.15em] w-[1.15em] shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `color-mix(in srgb, ${markColor} 16%, transparent)`, color: markColor }}
          >
            <svg viewBox="0 0 16 16" className="h-[0.7em] w-[0.7em]" fill="none" aria-hidden>
              <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="leading-[1.5]">{task}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Services "Icon Cards" — soft cards, each with a coloured icon badge, a bold title and a short
 * description (the classic "values" grid). Everything is configurable from Layout settings: an
 * icon per service (or an automatic guess from its title), badge shape / size / colours, card
 * style and radius, cards per row, gap, alignment, the description and the task list, and the
 * hover effect. Laid out with flex-wrap + a CSS-variable width calc (same as Media Columns) so an
 * incomplete last row can be centered; flex rows stretch, so cards in a row share one height.
 */
export function ServicesIconCardsSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const t = useT();
  const items = useMemo(() => services.filter((service) => service.title?.trim()), [services]);
  const count = items.length;
  const settings = presentation.iconCards ?? DEFAULT_SERVICES_ICON_CARDS_SETTINGS;

  const isLight = presentation.activeColorMode !== 'dark';
  const accent = presentation.ctaColor || presentation.cardAccentColor || '#f97316';
  const ink = isLight ? '#111111' : '#fafafa';

  const pricingStyle = useServicesPricingStyle(presentation);

  const show = resolveServicesCardElements(presentation);
  const ctaLabel = resolveServicesCtaLabel(presentation);

  const gapPx = GAP_PX[settings.gap];
  const vars = {
    '--ic-gap': `${gapPx}px`,
    // Phones always stack one card per row.
    '--ic-c-base': 1,
    '--ic-c-md': 2,
    '--ic-c-lg': settings.columns,
    '--ic-ink': ink,
    '--ic-muted': isLight ? 'rgba(17,17,17,0.62)' : 'rgba(250,250,250,0.62)',
    '--ic-accent': accent,
    color: 'var(--ic-ink)',
  } as CSSProperties;

  const listRef = useRef<HTMLDivElement>(null);
  const entranceKey = `${count}|${settings.columns}|${show.title}|${show.description}|${show.price}|${show.delivery}|${show.tasks}|${show.cta}`;

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || count === 0) return undefined;
    const list = listRef.current;
    if (!list || prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | null = null;
    let refreshId = 0;
    try {
      gsap.registerPlugin(ScrollTrigger);
      const scroller = getScrollParent(list) ?? undefined;
      const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-ic-card]'));
      const badges = Array.from(list.querySelectorAll<HTMLElement>('[data-ic-badge]'));
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: list, scroller, start: 'top 88%', once: true },
        });
        tl.fromTo(
          cards,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity' }
        ).fromTo(
          badges,
          { scale: 0.4, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.08, clearProps: 'transform,opacity' },
          0.18
        );
      }, list);
      refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ServicesIconCardsSection] deferred refresh() failed', error);
        }
      }, 90);
    } catch (error) {
      console.error('[ServicesIconCardsSection] GSAP entrance setup failed', error);
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entranceKey encodes count + layout settings
  }, [entranceKey]);

  if (count === 0) return null;

  const centered = settings.textAlign === 'center';
  const size = ICON_SIZE[settings.iconSize];
  const plain = settings.cardStyle === 'plain';
  const baseSurface = cardSurface(settings.cardStyle, isLight);
  // Card color: a palette token blended over the page at the chosen strength; the text switches
  // to whichever ink reads best on the colour the card really shows.
  const cardColorToken = settings.cardColor ?? 'auto';
  const cardFill =
    cardColorToken === 'auto'
      ? null
      : featuredFill(
          resolveHeroPaletteColor(
            mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette),
            cardColorToken as HeroPaletteTokenId
          ),
          settings.cardColorOpacity ?? 100,
          isLight ? '#ffffff' : '#0a0a0a'
        );
  const cardInk = cardFill ? readableInk(cardFill.blended) : ink;
  const filledSurface: CSSProperties = cardFill
    ? {
        ...baseSurface,
        backgroundColor: cardFill.fill,
        '--ic-ink': cardInk,
        '--ic-muted': withAlpha(cardInk, 0.68),
        color: cardInk,
      } as CSSProperties
    : baseSurface;
  // Card border (shared Border / Border color settings). A real border replaces the Outline
  // style's hairline ring so the two never stack.
  const hasBorder = pricingStyle.borderWidthPx != null || pricingStyle.borderColor != null;
  const surface: CSSProperties = hasBorder
    ? {
        ...filledSurface,
        ...(settings.cardStyle === 'outlined' ? { boxShadow: undefined } : null),
        borderStyle: 'solid',
        borderWidth: pricingStyle.borderWidthPx ?? 1,
        borderColor:
          pricingStyle.borderColor ??
          (cardFill ? withAlpha(cardInk, 0.22) : isLight ? 'rgba(10,10,10,0.12)' : 'rgba(255,255,255,0.14)'),
      }
    : filledSurface;

  return (
    <div
      ref={listRef}
      className={`flex w-full flex-wrap gap-[var(--ic-gap)] ${settings.centerLastRow ? 'justify-center' : 'justify-start'}`}
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

        const iconKey = resolveServiceIconKey(settings.icons[item.id], item.title, index);
        const badgeColor =
          settings.iconColor === 'multicolor'
            ? MULTICOLOR[index % MULTICOLOR.length]
            : settings.iconColor === 'accent'
              ? accent
              : null;
        const contrast = badgeColor ? pickContrastInk(badgeColor) : null;
        // On a light badge (yellow…) a deep shade of the badge reads better than flat black.
        const glyphOnBadge =
          badgeColor && contrast === '#0a0a0a' ? `color-mix(in srgb, ${badgeColor} 30%, #000)` : '#ffffff';
        const bare = settings.iconShape === 'bare';
        const badgeStyle: CSSProperties = bare
          ? { color: badgeColor ?? cardInk }
          : {
              width: size.badge,
              height: size.badge,
              borderRadius: settings.iconShape === 'circle' ? '9999px' : `${Math.round(size.badge * 0.3)}px`,
              backgroundColor: badgeColor ?? `color-mix(in srgb, ${cardInk} 9%, transparent)`,
              color: badgeColor ? glyphOnBadge : cardInk,
            };

        return (
          <article
            key={item.id || index}
            data-ic-card=""
            data-pf-no-color-transition=""
            className={`group relative flex min-w-0 flex-col [--c:var(--ic-c-base)] sm:[--c:var(--ic-c-md)] lg:[--c:var(--ic-c-lg)] w-[calc((100%-(var(--c)-1)*var(--ic-gap))/var(--c))] ${
              centered ? 'items-center text-center' : 'items-start text-left'
            } ${plain ? 'px-2 py-4' : 'px-6 py-9 sm:px-9 sm:py-11'} transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              settings.hoverEffect === 'lift' ? 'md:hover:-translate-y-1.5' : ''
            } ${
              settings.hoverEffect === 'glow'
                ? 'md:hover:!shadow-[0_0_0_1.5px_var(--ic-accent),0_24px_48px_-24px_var(--ic-accent)]'
                : ''
            }`}
            style={{
              borderRadius: RADIUS[settings.cardRadius],
              ...surface,
            }}
          >
            <span
              data-ic-badge=""
              data-pf-no-color-transition=""
              className={`inline-flex shrink-0 items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                settings.hoverEffect === 'icon' ? 'md:group-hover:-rotate-6 md:group-hover:scale-[1.14]' : ''
              }`}
              style={badgeStyle}
            >
              <ServiceIcon
                name={iconKey}
                strokeWidth={bare ? 1.7 : 2.1}
                className="block"
                size={bare ? Math.round(size.badge * 0.8) : size.glyph}
              />
            </span>
            {show.title ? (
            <h3
              className="mt-5 font-sans font-semibold leading-[1.2] tracking-[-0.02em]"
              style={{
                fontSize: `calc(clamp(1.2rem, 1rem + 0.9vw, 1.6rem) * var(--pf-services-font-scale, 1))`,
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
                  <span className="ml-1.5 font-normal text-[color:var(--ic-muted)]" style={{ fontSize: FONT(0.8) }}>
                    {priceSuffix}
                  </span>
                ) : null}
              </p>
            ) : null}
            {delivery ? (
              <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[color:var(--ic-muted)]">
                {delivery}
              </p>
            ) : null}
            {description ? (
              <p
                className={`mt-3 max-w-[34rem] leading-[1.7] text-[color:var(--ic-muted)] ${centered ? 'mx-auto' : ''}`}
                style={{ fontSize: FONT(0.9) }}
              >
                {description}
              </p>
            ) : null}
            {tasks.length > 0 ? (
              <IconCardTasks
                tasks={tasks}
                layout={settings.tasksStyle ?? 'checklist'}
                centered={centered}
                ink={cardInk}
                isLight={isLight}
                markColor={badgeColor ?? accent}
                label={t('{title} — included', { title: item.title })}
              />
            ) : null}
            {show.cta ? (
              <ServicesOrderButton
                pricingStyle={pricingStyle}
                label={ctaLabel}
                ink={cardInk}
                surface={cardFill ? cardFill.blended : isLight ? '#ffffff' : '#0a0a0a'}
                className="group/cta mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.85rem] font-semibold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                style={{ backgroundColor: cardInk, color: cardFill ? cardFill.blended : isLight ? '#ffffff' : '#0a0a0a' }}
                autoContent={
                  <>
                    {ctaLabel}
                    <span aria-hidden className="inline-block transition-transform duration-500 group-hover/cta:translate-x-0.5">
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
