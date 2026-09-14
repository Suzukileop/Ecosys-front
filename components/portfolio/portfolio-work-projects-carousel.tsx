'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsCarouselAspect,
  PortfolioWorkProjectsCarouselImageSize,
  PortfolioWorkProjectsCarouselRadius,
  PortfolioWorkProjectsCarouselSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_CAROUSEL_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsCarouselSettings,
} from '@/components/portfolio/portfolio-work-settings';

const CAROUSEL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const CAROUSEL_SNAP_MS = 680;
const DRAG_THRESHOLD_PX = 8;
const DESKTOP_MQ = '(min-width: 768px)';

const ENTER_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 22px, 0)',
};

const SLIDE_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(36px, 18px, 0)',
};

function carouselRadiusClass(radius: PortfolioWorkProjectsCarouselRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'md') return 'rounded-2xl';
  return 'rounded-[1.75rem] sm:rounded-[2rem]';
}

function carouselAspectClass(aspect: PortfolioWorkProjectsCarouselAspect): string {
  if (aspect === 'landscape') return 'aspect-[4/3]';
  if (aspect === 'portrait') return 'aspect-[3/4]';
  return 'aspect-square';
}

function carouselImageSizeClass(size: PortfolioWorkProjectsCarouselImageSize): string {
  switch (size) {
    case 'sm':
      return 'w-[14rem] sm:w-[16rem] lg:w-[18rem]';
    case 'md':
      return 'w-[18rem] sm:w-[22rem] lg:w-[24rem]';
    case 'xl':
      return 'w-[min(100%,28rem)] sm:w-[34rem] lg:w-[40rem] xl:w-[44rem]';
    default:
      return 'w-[22rem] sm:w-[28rem] lg:w-[32rem]';
  }
}

function carouselGapClass(gap: PortfolioWorkProjectsCarouselSettings['gap']): string {
  if (gap === 'tight') return 'gap-4 sm:gap-5';
  if (gap === 'xl') return 'gap-16 sm:gap-24 lg:gap-32 xl:gap-40';
  return 'gap-10 sm:gap-14 lg:gap-16';
}

function formatCarouselIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function wordLetterCount(word: string): number {
  return (word.match(/\p{L}/gu) ?? []).length;
}

function splitEditorialTitle(title: string): { lead: string; italic: string } | null {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const last = words[words.length - 1];
  if (wordLetterCount(last) < 4) return null;
  return { lead: words.slice(0, -1).join(' '), italic: last };
}

function EditorialTitleText({ text }: { text: string }) {
  const parts = splitEditorialTitle(text);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.lead}{' '}
      <span className="font-medium italic tracking-[-0.03em]">{parts.italic}</span>
    </>
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function carouselScrollTargets(el: HTMLElement | null): EventTarget[] {
  const targets: EventTarget[] = [window];
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const overflowY = String(getComputedStyle(node).overflowY);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      targets.push(node);
    }
    node = node.parentElement;
  }
  return targets;
}

function nearestScrollRoot(el: HTMLElement | null): HTMLElement | null {
  const nested = carouselScrollTargets(el).find((target) => target !== window);
  return nested instanceof HTMLElement ? nested : null;
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.85s ${CAROUSEL_EASE} ${delayMs}ms, transform 1.05s ${CAROUSEL_EASE} ${delayMs}ms`;
  el.style.opacity = '1';
  el.style.transform = 'translate3d(0, 0, 0)';
  el.dataset.revealed = 'true';
}

function showElementNow(el: HTMLElement): void {
  el.style.transition = 'none';
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.dataset.revealed = 'true';
}

function parseEnterDelay(el: HTMLElement): number {
  const raw = el.dataset.enterDelay;
  const delay = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(delay) ? delay : 0;
}

function useCarouselEntrance<T extends HTMLElement = HTMLElement>(
  readyKey: string,
  mode: 'self' | 'descendants'
): RefObject<T | null> {
  const rootRef = useRef<T | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets =
      mode === 'self'
        ? [root]
        : Array.from(root.querySelectorAll<HTMLElement>('[data-carousel-enter]'));

    const revealAll = (instant: boolean) => {
      for (const el of targets) {
        if (el.dataset.revealed === 'true') continue;
        if (instant) showElementNow(el);
        else revealElement(el, parseEnterDelay(el));
      }
    };

    if (prefersReducedMotion()) {
      revealAll(true);
      return undefined;
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      revealAll(false);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: '48px 0px',
        root: nearestScrollRoot(root),
      }
    );
    observer.observe(root);
    const failSafe = window.setTimeout(reveal, 1600);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [readyKey, mode]);

  return rootRef;
}

type SlideMetrics = {
  stepPx: number;
  maxIndex: number;
};

function useCarouselSlideMetrics(
  viewportRef: RefObject<HTMLDivElement | null>,
  itemCount: number,
  imageSize: PortfolioWorkProjectsCarouselImageSize,
  gap: PortfolioWorkProjectsCarouselSettings['gap']
): SlideMetrics {
  const [metrics, setMetrics] = useState<SlideMetrics>({ stepPx: 0, maxIndex: 0 });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || itemCount === 0) {
      setMetrics({ stepPx: 0, maxIndex: 0 });
      return undefined;
    }

    const measure = () => {
      const track = viewport.querySelector<HTMLElement>('[data-projects-carousel-track]');
      const first = viewport.querySelector<HTMLElement>('[data-projects-carousel-item]');
      if (!track || !first) return;

      const gapPx =
        Number.parseFloat(
          window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '0'
        ) || 0;
      const stepPx = first.offsetWidth + gapPx;
      const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const maxIndex =
        stepPx > 0 ? Math.max(0, Math.min(itemCount - 1, Math.ceil(overflow / stepPx - 0.01))) : 0;

      setMetrics({ stepPx, maxIndex });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [viewportRef, itemCount, imageSize, gap]);

  return metrics;
}

function useCarouselPointerDrag(
  viewportRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  stepPx: number,
  maxIndex: number,
  activeIndex: number,
  onIndex: (index: number) => void
): { offset: number; dragging: boolean } {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    lastX: number;
    lastT: number;
    velocity: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const stepRef = useRef(stepPx);
  const maxRef = useRef(maxIndex);
  const indexRef = useRef(activeIndex);
  const onIndexRef = useRef(onIndex);

  useEffect(() => {
    stepRef.current = stepPx;
    maxRef.current = maxIndex;
    indexRef.current = activeIndex;
    onIndexRef.current = onIndex;
  }, [stepPx, maxIndex, activeIndex, onIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !enabled) return undefined;

    const finish = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.startX;
      const step = stepRef.current;
      const current = indexRef.current;
      const max = maxRef.current;
      let next = current;
      if (drag.moved && step > 0) {
        const projected = dx + drag.velocity * 220;
        if (Math.abs(projected) > step * 0.16) {
          next = current + (projected < 0 ? 1 : -1);
        }
        next = Math.max(0, Math.min(max, next));
      }
      dragRef.current = null;
      setDragging(false);
      setOffset(0);
      if (next !== current) onIndexRef.current(next);
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      if (event.type === 'pointercancel') {
        suppressClickRef.current = false;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('button')) return;
      suppressClickRef.current = false;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        lastX: event.clientX,
        lastT: performance.now(),
        velocity: 0,
        moved: false,
      };
      viewport.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const now = performance.now();
      const dx = event.clientX - drag.startX;
      const dt = Math.max(1, now - drag.lastT);
      drag.velocity = (event.clientX - drag.lastX) / dt;
      drag.lastX = event.clientX;
      drag.lastT = now;
      if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD_PX) {
        drag.moved = true;
        suppressClickRef.current = true;
        setDragging(true);
      }
      if (!drag.moved) return;
      event.preventDefault();
      const atStart = indexRef.current <= 0 && dx > 0;
      const atEnd = indexRef.current >= maxRef.current && dx < 0;
      setOffset(dx * (atStart || atEnd ? 0.28 : 1));
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!suppressClickRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    };

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove, { passive: false });
    viewport.addEventListener('pointerup', finish);
    viewport.addEventListener('pointercancel', finish);
    viewport.addEventListener('click', onClickCapture, true);

    return () => {
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', finish);
      viewport.removeEventListener('pointercancel', finish);
      viewport.removeEventListener('click', onClickCapture, true);
      dragRef.current = null;
      setDragging(false);
      setOffset(0);
    };
  }, [viewportRef, enabled]);

  return { offset, dragging };
}

function useCarouselScrollKinetic(
  rootRef: { current: HTMLElement | null },
  readyKey: string
): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    const desktopMq = window.matchMedia(DESKTOP_MQ);
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = carouselScrollTargets(root);
    let raf = 0;
    let ticking = false;

    const reset = () => {
      root.style.setProperty('--carousel-scroll-x', '0px');
      const caption = root.querySelector<HTMLElement>('[data-carousel-caption]');
      const nav = root.querySelector<HTMLElement>('[data-carousel-nav]');
      if (caption) caption.style.opacity = '';
      if (nav) nav.style.opacity = '';
    };

    const apply = () => {
      ticking = false;
      if (!desktopMq.matches || reduceMq.matches) {
        reset();
        return;
      }
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > vh) return;

      const centered = (rect.top + rect.height * 0.45 - vh * 0.5) / vh;
      const clamped = Math.max(-1.1, Math.min(1.1, centered));
      root.style.setProperty('--carousel-scroll-x', `${(clamped * 22).toFixed(2)}px`);

      const fade = Math.max(0.58, 1 - Math.max(0, Math.abs(clamped) - 0.18) * 0.55);
      const caption = root.querySelector<HTMLElement>('[data-carousel-caption]');
      const nav = root.querySelector<HTMLElement>('[data-carousel-nav]');
      if (caption) caption.style.opacity = fade.toFixed(3);
      if (nav) nav.style.opacity = fade.toFixed(3);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(apply);
    };

    targets.forEach((target) => {
      target.addEventListener('scroll', onScroll, { passive: true });
    });
    window.addEventListener('resize', onScroll, { passive: true });
    desktopMq.addEventListener('change', onScroll);
    reduceMq.addEventListener('change', onScroll);
    apply();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      targets.forEach((target) => {
        target.removeEventListener('scroll', onScroll);
      });
      window.removeEventListener('resize', onScroll);
      desktopMq.removeEventListener('change', onScroll);
      reduceMq.removeEventListener('change', onScroll);
      reset();
    };
  }, [readyKey, rootRef]);
}

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function workRoleLabel(item: MarketplaceContentItem): string {
  const role = item.role?.trim();
  if (role) return role;
  if (!item.category?.trim() && item.genre?.trim()) return item.genre.trim();
  return '';
}

function CarouselStackStrip({
  tools,
  ink,
  rule,
}: {
  tools: string[];
  ink: string;
  rule: string;
}) {
  if (tools.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-x-0 gap-y-1.5" aria-label="Stack">
      {tools.map((tool, index) => (
        <li key={tool} className="flex items-center">
          {index > 0 ? (
            <span
              className="mx-2 h-3 w-px shrink-0 sm:mx-2.5"
              style={{ backgroundColor: rule }}
              aria-hidden
            />
          ) : null}
          <span
            className="text-[11px] font-medium lowercase tracking-[0.04em] sm:text-xs"
            style={{ color: ink }}
            data-pf-no-color-transition=""
          >
            {tool}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CarouselQuietNav({
  onPrev,
  onNext,
  canPrev,
  canNext,
  color,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  color: string;
}) {
  const buttonClass =
    'group/nav inline-flex items-center gap-2 bg-transparent text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity duration-300 hover:opacity-55 focus:outline-none focus-visible:opacity-55 disabled:pointer-events-none disabled:opacity-25 sm:text-[12px]';

  return (
    <div
      data-carousel-nav=""
      className="flex shrink-0 items-center gap-7 sm:gap-9"
      data-pf-no-color-transition=""
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className={buttonClass}
        style={{ color }}
        aria-label="Previous project"
        data-pf-no-color-transition=""
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
          <path
            d="M10.5 3.5 6 8l4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Prev
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className={buttonClass}
        style={{ color }}
        aria-label="Next project"
        data-pf-no-color-transition=""
      >
        Next
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
          <path
            d="M5.5 3.5 10 8l-4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function CarouselSlide({
  item,
  index,
  presentation,
  settings,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsCarouselSettings;
}) {
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const borderColor = presentation.cardBorderColor || muted;
  const stackInk = presentation.elementStyles?.toolsList?.color || muted;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const href = item.linkUrl?.trim() || null;
  const title = item.title?.trim() || '';
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item, presentation.maxToolsShown ?? 12);
  const hoverReveal = settings.hoverReveal !== false;
  const hoverStack = settings.hoverStack !== false && tools.length > 0;
  const radiusClass = carouselRadiusClass(settings.imageRadius ?? 'none');
  const sizeClass = carouselImageSizeClass(settings.imageSize ?? 'lg');
  const aspectClass = carouselAspectClass(settings.aspectRatio ?? 'square');
  const indexLabel = formatCarouselIndex(index);

  const media = (
    <div className={`flex flex-col ${sizeClass}`}>
      <div
        className={`relative w-full overflow-hidden ${aspectClass} ${radiusClass}`}
        style={{ backgroundColor: `${borderColor}44` }}
      >
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={title || 'Project'}
            fill
            draggable={false}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 40vw"
            data-pf-no-color-transition=""
            className={`object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              hoverReveal ? 'group-hover:scale-[1.055] group-focus-within:scale-[1.055]' : ''
            }`}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-6 text-center text-sm"
            style={{ color: muted }}
          >
            Add a thumbnail in Information → Portfolio
          </div>
        )}
        <span
          className="pointer-events-none absolute left-4 top-4 text-[10px] font-medium tabular-nums tracking-[0.2em] text-white sm:left-5 sm:top-5"
          style={{ textShadow: '0 1px 12px rgba(0,0,0,0.45)' }}
          aria-hidden
        >
          {indexLabel}
        </span>
        {hoverReveal ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100"
              aria-hidden
            />
            <div
              data-pf-no-color-transition=""
              className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-1.5 px-4 pb-4 pt-16 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100 sm:px-5 sm:pb-5"
            >
              {title ? (
                <p className="max-w-md text-[15px] font-medium leading-snug tracking-[-0.03em] text-white sm:text-base">
                  {title}
                </p>
              ) : null}
              {description ? (
                <p className="max-w-sm text-[13px] leading-relaxed text-white/78 sm:text-sm">
                  {description}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      {hoverStack ? (
        <div
          data-pf-no-color-transition=""
          className="mt-3 min-h-[1.75rem] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <CarouselStackStrip tools={tools} ink={stackInk} rule={`${stackInk}55`} />
        </div>
      ) : null}
    </div>
  );

  const wrapClass =
    'group block shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2';

  if (href) {
    const external = /^https?:\/\//i.test(href);
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          draggable={false}
          className={wrapClass}
          aria-label={title || 'Project'}
        >
          {media}
        </a>
      );
    }
    return (
      <Link href={href} draggable={false} className={wrapClass} aria-label={title || 'Project'}>
        {media}
      </Link>
    );
  }

  return <div className="group shrink-0">{media}</div>;
}

/**
 * Carousel header — kicker, italic last word, film-counter.
 * Hidden in JSX (FOUC-safe), revealed via IntersectionObserver.
 */
export function ProjectsCarouselSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  titleClassName = '',
  titleStyle,
  trailing,
  entryCount,
  accent,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  titleClassName?: string;
  titleStyle?: CSSProperties;
  trailing?: ReactNode;
  entryCount?: number;
  accent?: string;
  className?: string;
}) {
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  const isEmpty = !heading && !sub && !trailing;
  const rootRef = useCarouselEntrance<HTMLElement>(
    `${heading}|${sub}|${entryCount ?? 0}`,
    'descendants'
  );
  const mark = accent || subtitleColor;
  const countLabel =
    typeof entryCount === 'number' && entryCount > 0 ? String(entryCount).padStart(2, '0') : '';
  const restTitleStyle: CSSProperties = { ...(titleStyle ?? {}) };
  const incomingFontStyle = restTitleStyle.fontStyle;
  delete restTitleStyle.fontSize;
  delete restTitleStyle.lineHeight;
  delete restTitleStyle.letterSpacing;
  delete restTitleStyle.fontStyle;
  const allowItalicWord = incomingFontStyle !== 'italic';
  const resolvedTitleColor =
    (typeof titleStyle?.color === 'string' && titleStyle.color.trim()) || titleColor;

  if (isEmpty) return null;

  return (
    <header
      ref={rootRef}
      className={`mb-10 w-full sm:mb-14 lg:mb-16 ${className}`.trim()}
      data-pf-no-color-transition=""
    >
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          <div
            data-carousel-enter=""
            data-enter-delay="40"
            className="mb-5 flex items-center gap-3 sm:mb-6"
            style={ENTER_HIDDEN}
          >
            <span
              className="h-px w-7 shrink-0 sm:w-9"
              style={{ backgroundColor: mark, opacity: 0.7 }}
              aria-hidden
            />
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-[11px]"
              style={{ color: subtitleColor }}
              data-pf-no-color-transition=""
            >
              Selected
            </p>
          </div>
          {heading ? (
            <h2
              data-carousel-enter=""
              data-enter-delay="120"
              className={titleClassName.trim() || 'font-semibold tracking-[-0.045em]'}
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.2rem, 5.2vw, 3.85rem)',
                lineHeight: 1.06,
                ...ENTER_HIDDEN,
              }}
              data-pf-no-color-transition=""
            >
              {allowItalicWord ? <EditorialTitleText text={heading} /> : heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              data-carousel-enter=""
              data-enter-delay={heading ? '200' : '80'}
              className={`max-w-xl text-[15px] leading-[1.7] sm:text-base sm:leading-[1.75] ${
                heading ? 'mt-4 sm:mt-5' : ''
              }`}
              style={{ color: subtitleColor, ...ENTER_HIDDEN }}
              data-pf-no-color-transition=""
            >
              {sub}
            </p>
          ) : null}
        </div>
        <div
          data-carousel-enter=""
          data-enter-delay="160"
          className="flex shrink-0 flex-col items-end gap-3 pb-1"
          style={ENTER_HIDDEN}
        >
          {countLabel ? (
            <span
              className="text-[2.15rem] font-light tabular-nums leading-none tracking-[-0.06em] sm:text-[2.65rem]"
              style={{ color: resolvedTitleColor }}
              data-pf-no-color-transition=""
              aria-hidden
            >
              {countLabel}
            </span>
          ) : null}
          {trailing}
        </div>
      </div>
    </header>
  );
}

/** Image-led film strip — quiet nav, drag, editorial caption. */
export function ProjectsCarouselSection({
  title,
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  title?: string;
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsCarouselSettings(
    DEFAULT_PROJECTS_CAROUSEL_SETTINGS,
    presentation.projectsCarousel
  );
  const [carouselIndex, setCarouselIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const itemsKey = items.map((item) => item.id).join('|');
  const rootRef = useCarouselEntrance<HTMLDivElement>(itemsKey, 'descendants');
  const { stepPx, maxIndex } = useCarouselSlideMetrics(
    viewportRef,
    items.length,
    settings.imageSize ?? 'lg',
    settings.gap ?? 'md'
  );
  const activeIndex = Math.max(0, Math.min(carouselIndex, maxIndex));
  const canNav = items.length > 1 && maxIndex > 0;
  const { offset, dragging } = useCarouselPointerDrag(
    viewportRef,
    canNav,
    stepPx,
    maxIndex,
    activeIndex,
    (index) => setCarouselIndex(index)
  );
  useCarouselScrollKinetic(rootRef, itemsKey);

  const color = presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || color;
  const translateX = stepPx > 0 ? activeIndex * stepPx : 0;
  const focusBlurSiblings = settings.focusBlurSiblings !== false;
  const activeItem = items[activeIndex] ?? items[0];
  const activeTitle = activeItem?.title?.trim() || '';
  const activeRole = activeItem ? workRoleLabel(activeItem) : '';
  const progress = maxIndex > 0 ? (activeIndex / maxIndex) * 100 : items.length > 0 ? 100 : 0;

  if (items.length === 0) return null;

  const onPrev = () => setCarouselIndex((index) => Math.max(0, index - 1));
  const onNext = () => setCarouselIndex((index) => Math.min(maxIndex, index + 1));

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onNext();
    } else if (event.key === 'Home') {
      event.preventDefault();
      setCarouselIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setCarouselIndex(maxIndex);
    }
  };

  return (
    <div
      ref={rootRef}
      className="w-full"
      style={{ '--carousel-scroll-x': '0px' } as CSSProperties}
      data-pf-no-color-transition=""
    >
      <div
        ref={viewportRef}
        className={`overflow-hidden pb-3 pt-1 ${canNav ? 'cursor-grab' : ''} ${
          dragging ? 'cursor-grabbing select-none' : ''
        }`}
        style={{ touchAction: 'pan-y' }}
        aria-roledescription="carousel"
        aria-label={title?.trim() || 'Selected work'}
        tabIndex={canNav ? 0 : undefined}
        onKeyDown={canNav ? onKeyDown : undefined}
        data-dragging={dragging ? '1' : undefined}
      >
        <div
          data-projects-carousel-track
          className={`group/carousel flex ${carouselGapClass(settings.gap ?? 'md')} transform-gpu will-change-transform`}
          style={{
            transform: `translate3d(calc(${(-translateX + offset).toFixed(2)}px + var(--carousel-scroll-x, 0px)), 0, 0)`,
            transition: dragging ? 'none' : `transform ${CAROUSEL_SNAP_MS}ms ${CAROUSEL_EASE}`,
          }}
        >
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const recedeClass = isActive
              ? 'origin-bottom scale-100 opacity-100'
              : 'origin-bottom scale-[0.92] translate-y-3.5 opacity-[0.58]';
            const hoverFocusClass =
              !dragging && focusBlurSiblings
                ? 'group-hover/carousel:scale-[0.88] group-hover/carousel:translate-y-3.5 group-hover/carousel:opacity-40 hover:!translate-y-0 hover:!scale-100 hover:!opacity-100 group-focus-within/carousel:scale-[0.88] group-focus-within/carousel:translate-y-3.5 group-focus-within/carousel:opacity-40 focus-within:!translate-y-0 focus-within:!scale-100 focus-within:!opacity-100'
                : '';
            return (
              <div
                key={item.id}
                data-projects-carousel-item
                data-carousel-enter=""
                data-enter-delay={String(Math.min(index, 5) * 70)}
                data-pf-no-color-transition=""
                className="shrink-0"
                style={SLIDE_HIDDEN}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${formatCarouselIndex(index)} ${item.title?.trim() || 'Project'}`}
              >
                <div
                  className={`transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${recedeClass} ${hoverFocusClass}`}
                  style={{ zIndex: isActive ? 2 : 1 }}
                >
                  <CarouselSlide
                    item={item}
                    index={index}
                    presentation={presentation}
                    settings={settings}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        data-carousel-enter=""
        data-enter-delay="220"
        className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mt-8"
        style={ENTER_HIDDEN}
      >
        <div data-carousel-caption="" className="min-w-0" aria-live="polite">
          <p
            className="text-[10px] font-medium tabular-nums tracking-[0.22em] sm:text-[11px]"
            style={{ color: muted, opacity: 0.7 }}
            data-pf-no-color-transition=""
          >
            {formatCarouselIndex(activeIndex)}
            <span className="mx-2 opacity-40" aria-hidden>
              —
            </span>
            {formatCarouselIndex(Math.max(0, items.length - 1))}
          </p>
          {activeTitle ? (
            <h3
              className="mt-2 max-w-xl text-xl font-medium tracking-[-0.035em] sm:text-2xl sm:leading-tight"
              style={{ color }}
              data-pf-no-color-transition=""
            >
              <EditorialTitleText text={activeTitle} />
            </h3>
          ) : null}
          {activeRole ? (
            <p
              className={`text-[12px] tracking-[0.04em] sm:text-[13px] ${
                activeTitle ? 'mt-1.5' : 'mt-2'
              }`}
              style={{ color: muted }}
              data-pf-no-color-transition=""
            >
              {activeRole}
            </p>
          ) : null}
        </div>
        {canNav ? (
          <CarouselQuietNav
            color={color}
            canPrev={activeIndex > 0}
            canNext={activeIndex < maxIndex}
            onPrev={onPrev}
            onNext={onNext}
          />
        ) : null}
      </div>

      <div
        data-carousel-enter=""
        data-enter-delay="280"
        className="mt-6 h-px w-full overflow-hidden sm:mt-8"
        style={{ backgroundColor: `${muted}33`, ...ENTER_HIDDEN }}
        aria-hidden
        data-pf-no-color-transition=""
      >
        <div
          className="h-px origin-left"
          style={{
            width: `${progress}%`,
            backgroundColor: accent,
            transition: dragging ? 'none' : `width ${CAROUSEL_SNAP_MS}ms ${CAROUSEL_EASE}`,
          }}
          data-pf-no-color-transition=""
        />
      </div>
    </div>
  );
}

export function isProjectsCarouselDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-carousel';
}
