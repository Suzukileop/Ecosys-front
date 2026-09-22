'use client';

import {
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsCascadeCardHeight,
  PortfolioWorkProjectsCascadeCardWidth,
  PortfolioWorkProjectsCascadeImageRadius,
  PortfolioWorkProjectsCascadeVerticalGap,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_CASCADE_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsCascadeSettings,
} from '@/components/portfolio/portfolio-work-settings';

export function isProjectsCascadeDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-cascade';
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Nearest scrollable ancestor — this app can render inside a nested
 *  overflow-y:auto "pages" container, and a scroll listener on the wrong
 *  target silently never fires. Same helper as Experience Cards. */
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

/** True only for a genuine desktop/laptop pointer — same idiom as
 *  usePortfolioFinePointerDesktop in portfolio-section-primitives.tsx. Width
 *  alone misclassifies large tablets as desktop, so hover+fine-pointer is
 *  required too; a touch device always gets the plain static stack. */
function useCascadeFinePointerDesktop(minWidthPx = 1024) {
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

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(0, max);
}

function workTagLabels(item: MarketplaceContentItem, max = 6): string[] {
  return Array.from(new Set((item.tags ?? []).map((t) => t.trim()).filter(Boolean))).slice(0, max);
}

function workRoleLabel(item: MarketplaceContentItem): string {
  return item.role?.trim() || '';
}

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  const genre = item.genre?.trim();
  const role = item.role?.trim();
  if (genre && genre !== role) return genre;
  return '';
}

function cascadeCardWidthClass(width: PortfolioWorkProjectsCascadeCardWidth): string {
  switch (width) {
    case 'small':
      return 'w-full max-w-3xl mx-auto';
    case 'medium':
      return 'w-full max-w-5xl mx-auto';
    default:
      return 'w-full max-w-6xl xl:max-w-7xl mx-auto';
  }
}

function cascadeVerticalGapPx(gap: PortfolioWorkProjectsCascadeVerticalGap): number {
  switch (gap) {
    case 'sm':
      return 12;
    case 'lg':
      return 72;
    default:
      return 40;
  }
}

function cascadeImageRadiusClass(radius: PortfolioWorkProjectsCascadeImageRadius): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'xl':
      return 'rounded-[1.35rem] sm:rounded-[1.5rem]';
    default:
      return 'rounded-2xl';
  }
}

/** Desktop card min-height — via `lg:items-stretch` this also drives the thumbnail's height. */
function cascadeCardHeightClass(height: PortfolioWorkProjectsCascadeCardHeight): string {
  switch (height) {
    case 'compact':
      return 'lg:min-h-[28rem]';
    case 'standard':
      return 'lg:min-h-[32rem]';
    case 'xl':
      return 'lg:min-h-[44rem]';
    default:
      return 'lg:min-h-[38rem]';
  }
}

/** "View project ↗" — hovering swaps the label (and arrow) for an identical copy
 *  sliding in from below, inside an overflow:hidden mask. Ported from Experience
 *  Cards' CardsRepoLink (same look everywhere a card-level link appears). */
function CascadeProjectLink({ href, label, ink }: { href: string; label: string; ink: string }) {
  const textCloneRef = useRef<HTMLSpanElement | null>(null);
  const arrowCloneRef = useRef<SVGSVGElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const textClone = textCloneRef.current;
    const arrowClone = arrowCloneRef.current;
    if (!textClone || !arrowClone) return undefined;
    if (prefersReducedMotion()) return undefined;

    const tl = gsap
      .timeline({ paused: true, defaults: { duration: 0.5, ease: 'power3.inOut' } })
      .to(textClone.parentElement, { yPercent: -100 }, 0)
      .to(arrowClone.parentElement, { yPercent: -100 }, 0);
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, [label]);

  const onEnter = () => timelineRef.current?.play();
  const onLeave = () => timelineRef.current?.reverse();

  const isExternal = /^https?:\/\//i.test(href);
  const anchorProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <a
      href={href}
      {...anchorProps}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group/cascade-link inline-flex items-center gap-2.5 text-[0.82rem] font-medium tracking-[0.02em] outline-none focus-visible:opacity-70"
      style={{ color: ink }}
      data-pf-no-color-transition=""
    >
      <span className="relative inline-block h-[1.2em] overflow-hidden">
        <span className="block">{label}</span>
        <span ref={textCloneRef} className="absolute inset-x-0 top-full block">
          {label}
        </span>
      </span>
      <span className="relative inline-block h-[1em] w-[1em] shrink-0 overflow-hidden" aria-hidden>
        <svg viewBox="0 0 16 16" className="absolute inset-0 h-full w-full" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg ref={arrowCloneRef} viewBox="0 0 16 16" className="absolute inset-x-0 top-full h-full w-full" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

/** Sticky top offset (px) — keep in sync with --pf-work-cascade-stack-top (6rem) in globals.css. */
const CASCADE_TOP_OFFSET_PX = 96;
/** Same "escalier" depth model as Experience Cards: cumulative steps, geometry-only
 *  (no opacity fade — a covering card must stay at true 100% opacity or text on a
 *  light card ghosts faintly through). See buildCardsStackDepths in
 *  portfolio-section-primitives.tsx for the full rationale; ported verbatim. */
const CASCADE_SCALE_STEP = 0.02;
const CASCADE_SINK_PX = 20;

function buildCascadeDepths(stepProgress: number[]): number[] {
  const depths = new Array<number>(stepProgress.length + 1).fill(0);
  for (let i = stepProgress.length - 1; i >= 0; i -= 1) {
    depths[i] = stepProgress[i] + depths[i + 1];
  }
  return depths;
}

function CascadeProjectCard({
  item,
  settings,
  titleColor,
  mutedColor,
  bodyColor,
  accent,
  cardBg,
  stackIndex,
}: {
  item: MarketplaceContentItem;
  settings: ReturnType<typeof mergeProjectsCascadeSettings>;
  titleColor: string;
  mutedColor: string;
  bodyColor: string;
  accent: string;
  cardBg: string;
  stackIndex: number;
}) {
  const reduceMotion = prefersReducedMotion();
  const articleRef = useRef<HTMLElement | null>(null);
  const titleInnerRef = useRef<HTMLSpanElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const tagsListRef = useRef<HTMLDivElement | null>(null);

  const title = item.title?.trim() || '';
  const description = settings.showDescription ? item.description?.trim() || '' : '';
  const category = settings.showCategory ? workCategoryLabel(item) : '';
  const role = settings.showRole ? workRoleLabel(item) : '';
  const tags = settings.showTags ? workTagLabels(item) : [];
  const tools = settings.showTools ? workToolLabels(item) : [];
  const href = settings.showLink ? item.linkUrl?.trim() || '' : '';
  const mediaUrl = item.mediaUrl?.trim() || '';

  const labelParts: string[] = [category, role].filter(Boolean) as string[];
  const hasContent = Boolean(description) || tags.length > 0 || tools.length > 0;

  // Entrance, once per card — same choreography as Experience Cards: title
  // slides up out of its mask, description fades/slides in, tags cascade in.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const article = articleRef.current;
    if (!article) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = getScrollParent(article) ?? undefined;
    const titleInner = titleInnerRef.current;
    const desc = descRef.current;
    const tagItems = tagsListRef.current
      ? Array.from(tagsListRef.current.querySelectorAll<HTMLElement>('[data-cascade-tag]'))
      : [];

    // Guards the stacking recede effect below: it reads this attribute per
    // card and holds recede progress at 0 until the card reports 'true' here,
    // so a fast scroll can never fully cover a card before its own entrance
    // has finished (same race documented on Experience Cards).
    article.setAttribute('data-entrance-ready', 'false');

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        if (titleInner) gsap.set(titleInner, { yPercent: 0 });
        if (desc) gsap.set(desc, { autoAlpha: 1, y: 0 });
        if (tagItems.length) gsap.set(tagItems, { autoAlpha: 1, y: 0 });
        article.setAttribute('data-entrance-ready', 'true');
        return;
      }

      if (titleInner) gsap.set(titleInner, { yPercent: 110 });
      if (desc) gsap.set(desc, { autoAlpha: 0, y: 14 });
      if (tagItems.length) gsap.set(tagItems, { autoAlpha: 0, y: 10 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: article, scroller, start: 'top 82%', once: true },
        onComplete: () => {
          if (tagItems.length) gsap.set(tagItems, { clearProps: 'opacity,visibility' });
          article.setAttribute('data-entrance-ready', 'true');
        },
      });
      if (titleInner) tl.to(titleInner, { yPercent: 0, duration: 0.9, ease: 'power4.out' }, 0);
      if (desc) tl.to(desc, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.22);
      if (tagItems.length) {
        tl.to(tagItems, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out' }, 0.32);
      }
    }, article);

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // See portfolio-scrolltrigger-refresh-crash memory: GSAP's own refresh()
        // can throw internally on an init-time edge case; never let a deferred,
        // best-effort refresh take the whole page down.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);
    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [reduceMotion, title, description, tags.length]);

  return (
    <article
      ref={articleRef}
      data-entrance-ready="false"
      className={`pf-work-cascade-stack-card flex min-w-0 flex-col-reverse gap-8 p-6 sm:p-9 lg:flex-row ${cascadeCardHeightClass(settings.cardHeight)} lg:items-stretch lg:gap-14 lg:p-12`}
      style={{ backgroundColor: cardBg, zIndex: stackIndex + 1 }}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="pf-work-cascade-stack-header">
          {labelParts.length > 0 ? (
            <p
              className="mb-4 flex flex-wrap items-center gap-x-2.5 text-[0.62rem] font-semibold uppercase sm:mb-5 sm:text-[0.66rem]"
              style={{ letterSpacing: '0.18em', opacity: 0.65, color: mutedColor }}
            >
              {labelParts.map((part, index) => (
                <span key={`${part}-${index}`} className="flex items-center gap-x-2.5">
                  {index > 0 ? (
                    <span aria-hidden style={{ opacity: 0.45 }}>
                      &middot;
                    </span>
                  ) : null}
                  <span>{part}</span>
                </span>
              ))}
            </p>
          ) : null}
          {title ? (
            <h4
              className="overflow-hidden text-[2.5rem] leading-[0.95] sm:text-[3.25rem] lg:text-[3.75rem]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span ref={titleInnerRef} className="block" style={{ color: titleColor }}>
                {title}
              </span>
            </h4>
          ) : null}
        </div>

        {hasContent ? (
          <div className="mt-10 flex flex-col gap-8 sm:mt-14">
            {description ? (
              <p
                ref={descRef}
                className="max-w-2xl"
                style={{ color: bodyColor, opacity: 0.6, fontSize: '0.98rem', lineHeight: 1.7, fontWeight: 300 }}
              >
                {description}
              </p>
            ) : null}

            {tags.length > 0 ? (
              <div ref={tagsListRef} className="flex flex-col gap-2.5">
                {tags.map((tag) => (
                  <p
                    key={tag}
                    data-cascade-tag=""
                    className="flex items-baseline gap-3 text-[0.92rem]"
                    style={{ color: bodyColor }}
                  >
                    <span aria-hidden style={{ color: accent, opacity: 0.7 }}>
                      &mdash;
                    </span>
                    <span style={{ opacity: 0.85 }}>{tag}</span>
                  </p>
                ))}
              </div>
            ) : null}

            {tools.length > 0 ? (
              <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Stack">
                {tools.map((tool) => (
                  <li
                    key={tool}
                    className="text-[0.62rem] font-medium uppercase"
                    style={{ color: mutedColor, opacity: 0.5, letterSpacing: '0.16em' }}
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {href ? (
          <div className="mt-8 flex flex-col items-start">
            <CascadeProjectLink href={href} label={settings.linkLabel || 'View project'} ink={titleColor} />
          </div>
        ) : null}
      </div>

      {mediaUrl ? (
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden lg:aspect-auto lg:w-[42%]">
          <div className={`relative h-full w-full overflow-hidden ${cascadeImageRadiusClass(settings.imageRadius)}`}>
            <Image
              src={mediaUrl}
              alt={title || 'Project'}
              fill
              draggable={false}
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

/**
 * Cascade — the Experience "Cards" stacking scroll effect (same-top sticky cards,
 * cumulative depth scale/sink recede, no opacity fade), reused for the Work
 * section with each project's thumbnail added beside the text on desktop.
 */
export function ProjectsCascadeGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
  colorMode = 'dark',
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
  /** Resolved active color mode (Global → Theme, honoring this section's own override) —
   *  same threading pattern as Footer's premium designs (`globalColorMode`). Needed
   *  because the card surface must invert with the theme; every other color here
   *  (title/muted/body/accent) already arrives pre-resolved via `presentation`, but
   *  there's no equivalent "card background" field for this design to read. */
  colorMode?: 'light' | 'dark';
}) {
  const stackRef = useRef<HTMLDivElement | null>(null);
  const settings = mergeProjectsCascadeSettings(DEFAULT_PROJECTS_CASCADE_SETTINGS, presentation.projectsCascade);
  const cascadeEnabled = settings.stackEffect !== 'static';
  const isDesktopWidth = useCascadeFinePointerDesktop(1024);
  const isDark = colorMode !== 'light';

  const titleColor = presentation.titleColor;
  const mutedColor = presentation.subtitleColor;
  const bodyColor = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;
  // Same formula as Experience Cards' CardsExperienceEntry (this design's own port
  // source): a dark canvas gets a near-black card tinted from the section's own
  // background so it reads as "the same surface, slightly raised" rather than a
  // flat, unrelated black box; a light canvas just gets a plain white card. Fixes
  // the card staying hardcoded white in dark mode (was `var(--pf-work-cascade-
  // card-bg, #ffffff)` — that custom property was never actually defined anywhere
  // in globals.css, so the #ffffff fallback was the only value that ever applied).
  const sectionBg = presentation.sectionBackgroundColor?.trim() || '#0a0a0a';
  const cardBg = isDark ? `color-mix(in srgb, ${sectionBg} 97%, white 3%)` : '#ffffff';

  // Equal card height (opt-in): sticky siblings aren't a grid, so there's no
  // align-items:stretch to reach for — and in cascade mode a shorter card would
  // leave the taller card it's covering visibly peeking out underneath. Same
  // JS-measured min-height approach as Experience Cards.
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !settings.equalHeight) return undefined;
    const stack = stackRef.current;
    if (!stack) return undefined;
    const cards = Array.from(
      stack.querySelectorAll<HTMLElement>(':scope > .pf-work-cascade-stack-item > .pf-work-cascade-stack-card')
    );
    if (cards.length < 2) return undefined;

    let ticking = false;
    const equalize = () => {
      ticking = false;
      cards.forEach((card) => {
        card.style.minHeight = '';
      });
      const tallest = Math.max(...cards.map((card) => card.getBoundingClientRect().height));
      cards.forEach((card) => {
        card.style.minHeight = `${Math.ceil(tallest)}px`;
      });
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    };
    const onResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(equalize);
    };

    equalize();
    let cancelled = false;
    void document.fonts?.ready?.then(() => {
      if (!cancelled) equalize();
    });
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      cards.forEach((card) => {
        card.style.minHeight = '';
      });
    };
  }, [items, settings.equalHeight, settings.cardWidth, settings.imageRadius]);

  // Depth recede on scroll — vanilla JS (not GSAP/ScrollTrigger scrub) on
  // purpose, same as Experience Cards: rAF-throttled getBoundingClientRect()
  // on the next card, listening on the real scroll container.
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !cascadeEnabled || !isDesktopWidth || prefersReducedMotion()) {
      return undefined;
    }
    const stack = stackRef.current;
    if (!stack) return undefined;

    const stackItems = Array.from(stack.querySelectorAll<HTMLElement>(':scope > .pf-work-cascade-stack-item'));
    const pairs = stackItems
      .map((el, index) => ({
        card: el.querySelector<HTMLElement>('.pf-work-cascade-stack-card'),
        nextItem: stackItems[index + 1],
      }))
      .filter(
        (pair): pair is { card: HTMLElement; nextItem: HTMLElement } => Boolean(pair.card && pair.nextItem)
      );
    if (pairs.length === 0) return undefined;

    const scrollTarget: EventTarget = getScrollParent(stack) ?? window;
    let ticking = false;

    const update = () => {
      ticking = false;
      const travel = Math.max(window.innerHeight - CASCADE_TOP_OFFSET_PX, 1);
      const stepProgress = pairs.map(({ nextItem }) => {
        const remaining = nextItem.getBoundingClientRect().top - CASCADE_TOP_OFFSET_PX;
        return Math.min(1, Math.max(0, 1 - remaining / travel));
      });
      const depths = buildCascadeDepths(stepProgress);
      pairs.forEach(({ card }, i) => {
        let depth = depths[i];
        if (card.getAttribute('data-entrance-ready') !== 'true') depth = 0;
        const scale = 1 - depth * CASCADE_SCALE_STEP;
        const sink = depth * CASCADE_SINK_PX;
        card.style.transform = `scale(${scale}) translateY(-${sink}px)`;
      });
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    scrollTarget.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      scrollTarget.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      pairs.forEach(({ card }) => {
        card.style.transform = '';
      });
    };
  }, [items, cascadeEnabled, isDesktopWidth, settings.cardWidth, settings.verticalGap]);

  if (items.length === 0) return null;

  return (
    <div className={cascadeCardWidthClass(settings.cardWidth)}>
      <div
        ref={stackRef}
        className={`pf-work-cascade-stack${cascadeEnabled ? '' : ' pf-work-cascade-stack--static'}`}
        style={
          {
            ['--pf-work-cascade-vertical-gap' as string]: `${cascadeVerticalGapPx(settings.verticalGap)}px`,
          } as CSSProperties
        }
      >
        {items.map((item, index) => (
          <div key={item.id} className="pf-work-cascade-stack-item" style={{ zIndex: index + 1 }}>
            <CascadeProjectCard
              item={item}
              settings={settings}
              titleColor={titleColor}
              mutedColor={mutedColor}
              bodyColor={bodyColor}
              accent={accent}
              cardBg={cardBg}
              stackIndex={index}
            />
          </div>
        ))}
        <div className="pf-work-cascade-stack-end" aria-hidden />
      </div>
    </div>
  );
}
