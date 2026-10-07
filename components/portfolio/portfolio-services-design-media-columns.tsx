'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { ProfileServiceItem } from '@/types/profile';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import {
  DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS,
  type PortfolioServicesMediaColumnsGap,
  type PortfolioServicesMediaColumnsRadius,
  type PortfolioServicesMediaColumnsRatio,
  type PortfolioServicesPresentationSettings,
} from '@/components/portfolio/portfolio-services-settings';

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
 * centered, the description, and the hover effect (zoom / lift / none). Cards are laid out with
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
  const items = useMemo(() => services.filter((service) => service.title?.trim()), [services]);
  const count = items.length;
  const settings = presentation.mediaColumns ?? DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS;

  const isLight = presentation.activeColorMode === 'light';
  const accent = presentation.ctaColor || presentation.cardAccentColor || '#f97316';
  const fallbackGradient = `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 45%, #0a0a0a) 100%)`;

  const gapPx = GAP_PX[settings.gap];
  const vars = {
    '--mc-gap': `${gapPx}px`,
    '--mc-row-gap': `${Math.round(gapPx * 1.6)}px`,
    '--mc-c-base': settings.mobileColumns,
    '--mc-c-md': 2,
    '--mc-c-lg': settings.columns,
    '--mc-ink': isLight ? '#0a0a0a' : '#fafafa',
    '--mc-muted': isLight ? 'rgba(10,10,10,0.6)' : 'rgba(250,250,250,0.6)',
    color: 'var(--mc-ink)',
  } as CSSProperties;

  const listRef = useRef<HTMLDivElement>(null);
  const entranceKey = `${count}|${settings.columns}|${settings.mobileColumns}|${settings.mediaRatio}`;

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
        const description = item.description?.trim();
        return (
          <article
            key={item.id || index}
            data-mc-card=""
            className={`group min-w-0 [--c:var(--mc-c-base)] sm:[--c:var(--mc-c-md)] lg:[--c:var(--mc-c-lg)] w-[calc((100%-(var(--c)-1)*var(--mc-gap))/var(--c))] ${
              centered ? 'text-center' : 'text-left'
            } ${
              settings.hoverEffect === 'lift'
                ? 'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2'
                : ''
            }`}
            data-pf-no-color-transition=""
          >
            <div
              className={`relative w-full overflow-hidden ${RATIO_CLASS[settings.mediaRatio]}`}
              style={{ borderRadius: RADIUS[settings.cardRadius] }}
            >
              <div
                className={`absolute inset-0 will-change-transform ${
                  settings.hoverEffect === 'zoom'
                    ? 'transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]'
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
                  />
                ) : (
                  <div className="h-full w-full" style={{ background: fallbackGradient }} aria-hidden />
                )}
              </div>
            </div>
            <h3
              className="mt-5 font-sans font-normal leading-[1.15] tracking-[-0.015em]"
              style={{ fontSize: FONT(1.5), overflowWrap: 'anywhere' }}
            >
              {item.title}
            </h3>
            {settings.showDescription && description ? (
              <p
                className="mt-3 leading-[1.55] text-[color:var(--mc-muted)]"
                style={{ fontSize: FONT(0.95) }}
              >
                {description}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
