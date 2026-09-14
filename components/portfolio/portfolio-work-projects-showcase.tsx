'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsShowcaseRadius,
  PortfolioWorkProjectsShowcaseSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_SHOWCASE_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsShowcaseSettings,
} from '@/components/portfolio/portfolio-work-settings';

/** Same timing / easing principle as Gallery → Image haute + rangée. */
const SHOWCASE_SLIDE_MS = 620;
const THUMB_GAP = 12;
const SHOWCASE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SHOWCASE_DESKTOP_MQ = '(min-width: 1024px)';
const SHOWCASE_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 28px, 0)',
};

const SHOWCASE_MOTION_CSS = `
@media (prefers-reduced-motion: reduce) {
  [data-showcase-enter] {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    transition: none !important;
  }
}
`;

function showcaseRadiusClass(radius: PortfolioWorkProjectsShowcaseRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'md') return 'rounded-2xl';
  return 'rounded-[1.5rem] sm:rounded-[1.75rem] lg:rounded-[2rem]';
}

function workRoleLabel(item: MarketplaceContentItem): string {
  const role = item.role?.trim();
  if (role) return role;
  if (!item.category?.trim() && item.genre?.trim()) return item.genre.trim();
  return '';
}

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  const genre = item.genre?.trim();
  const role = item.role?.trim();
  if (genre && genre !== role) return genre;
  return '';
}

function formatShowcaseIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function showcaseScrollRoot(el: HTMLElement | null): HTMLElement | null {
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

function wordLetterCount(word: string): number {
  return (word.match(/\p{L}/gu) ?? []).length;
}

/** Italicize the last word when it stays readable (2+ words, 4+ letters). */
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

function omitHeaderTitleMetrics(style?: CSSProperties): CSSProperties {
  if (!style) return {};
  const rest = { ...style };
  delete rest.fontSize;
  delete rest.lineHeight;
  delete rest.letterSpacing;
  delete rest.fontStyle;
  return rest;
}

function measureShowcaseThumbStep(node: HTMLDivElement, visible: number, gap: number): number {
  if (visible <= 0) return 0;
  const itemWidth = (node.clientWidth - (visible - 1) * gap) / visible;
  return itemWidth + gap;
}

function clampShowcaseIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.85s ${SHOWCASE_EASE} ${delayMs}ms, transform 0.95s ${SHOWCASE_EASE} ${delayMs}ms`;
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

function ShowcaseHref({
  href,
  className,
  style,
  ariaLabel,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  const resolvedClass = `${className ?? ''} no-underline`.trim();
  const resolvedStyle: CSSProperties = { color: 'inherit', textDecoration: 'none', ...style };
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={resolvedClass}
        style={resolvedStyle}
        aria-label={ariaLabel}
        data-pf-no-color-transition=""
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={resolvedClass}
      style={resolvedStyle}
      aria-label={ariaLabel}
      data-pf-no-color-transition=""
    >
      {children}
    </Link>
  );
}

function ShowcaseChevron({
  direction,
  onClick,
  label,
  color,
  disabled,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  label: string;
  color: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-pf-no-color-transition=""
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm transition-opacity duration-300 ease-out hover:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-current disabled:pointer-events-none disabled:opacity-25"
      style={{ color }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        className="h-5 w-5"
        aria-hidden
      >
        {direction === 'prev' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        )}
      </svg>
    </button>
  );
}

function ShowcasePrimaryMedia({
  item,
  presentation,
  settings,
  reduceMotion,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsShowcaseSettings;
  reduceMotion: boolean | null;
}) {
  const mediaUrl = item.mediaUrl?.trim() || null;
  const muted = presentation.subtitleColor;
  const border = presentation.cardBorderColor || muted;
  const radiusClass = showcaseRadiusClass(settings.mediaRadius ?? 'xl');
  const href = item.linkUrl?.trim() || null;
  const title = item.title?.trim() || 'Project';
  const role = workRoleLabel(item);
  const showRole = settings.showRole !== false && Boolean(role);

  const imageClass = `object-cover object-center ${
    reduceMotion
      ? ''
      : 'transition-transform duration-[1.15s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/media:scale-[1.035]'
  }`;

  const mediaNode = mediaUrl ? (
    href ? (
      <ShowcaseHref href={href} className="absolute inset-0" ariaLabel={`Open ${title}`}>
        <span className="relative block h-full w-full">
          <Image
            src={mediaUrl}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className={imageClass}
            priority={false}
            data-pf-no-color-transition=""
          />
        </span>
      </ShowcaseHref>
    ) : (
      <Image
        src={mediaUrl}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 58vw"
        className={imageClass}
        priority={false}
        data-pf-no-color-transition=""
      />
    )
  ) : (
    <div
      className="flex h-full w-full items-center justify-center px-6 text-center text-sm leading-[1.7]"
      style={{ color: muted }}
    >
      Add a thumbnail in Information → Portfolio
    </div>
  );

  return (
    <figure
      className={`group/media relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[36rem] ${radiusClass}`}
      style={{ backgroundColor: `${border}28` }}
      data-pf-no-color-transition=""
    >
      {/* Crossfade only — no dark veil, keeps previous frame underneath. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={item.id}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          {mediaNode}
        </motion.div>
      </AnimatePresence>

      {showRole ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-7">
          <p
            className="w-fit text-[10px] font-medium uppercase tracking-[0.22em] sm:text-[11px]"
            style={{
              color: '#f7f7f7',
              textShadow: '0 1px 18px rgba(0,0,0,0.42)',
            }}
            data-pf-no-color-transition=""
          >
            {role}
          </p>
        </div>
      ) : null}
    </figure>
  );
}

function ShowcaseDetails({
  item,
  index,
  total,
  presentation,
  settings,
}: {
  item: MarketplaceContentItem;
  index: number;
  total: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsShowcaseSettings;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;
  const title = item.title?.trim() || '';
  const description = item.description?.trim() || '';
  const category = workCategoryLabel(item);
  const href = item.linkUrl?.trim() || null;
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showCategory = settings.showCategory !== false && Boolean(category);
  const categoryLabel = settings.categoryLabel?.trim() || 'Category';

  return (
    <div className="min-w-0" aria-live="polite" aria-atomic="true">
      {total > 0 ? (
        <p
          className="mb-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em] sm:mb-7 sm:text-[11px]"
          style={{ color: muted }}
          data-pf-no-color-transition=""
        >
          <span style={{ color: accent }}>{formatShowcaseIndex(index)}</span>
          <span
            className="h-px w-7 shrink-0 sm:w-9"
            style={{ backgroundColor: accent, opacity: 0.55 }}
            aria-hidden
          />
          <span style={{ opacity: 0.48 }}>{formatShowcaseIndex(total - 1)}</span>
        </p>
      ) : null}

      {title ? (
        <h3
          className="max-w-xl text-[2.15rem] font-semibold tracking-[-0.045em] sm:text-[2.7rem] lg:text-[3.25rem] lg:leading-[1.04]"
          style={{ color: titleColor }}
          data-pf-no-color-transition=""
        >
          {href ? (
            <ShowcaseHref
              href={href}
              className="rounded-sm outline-none transition-opacity duration-500 hover:opacity-70 focus-visible:opacity-70"
            >
              <EditorialTitleText text={title} />
            </ShowcaseHref>
          ) : (
            <EditorialTitleText text={title} />
          )}
        </h3>
      ) : null}

      {showDescription ? (
        <p
          className={`max-w-[26rem] text-[0.9375rem] leading-[1.8] sm:text-[0.98rem] sm:leading-[1.85] ${
            title ? 'mt-6 sm:mt-7' : ''
          }`}
          style={{ color: muted, opacity: 0.88 }}
          data-pf-no-color-transition=""
        >
          {description}
        </p>
      ) : null}

      {showCategory ? (
        <div
          className={`${title || showDescription ? 'mt-9 sm:mt-11' : ''}`}
          data-pf-no-color-transition=""
        >
          <p
            className="text-[10px] font-medium uppercase tracking-[0.22em] sm:text-[11px]"
            style={{ color: muted, opacity: 0.62 }}
          >
            {categoryLabel}
          </p>
          <p
            className="mt-2.5 text-sm tracking-[-0.015em] sm:text-[0.95rem]"
            style={{ color: titleColor }}
          >
            {category}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Showcase header — kicker, italic last word, airy subtitle.
 * Hidden in JSX (FOUC-safe), revealed via IntersectionObserver.
 */
export function ProjectsShowcaseSectionHeader({
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
  const headerRef = useRef<HTMLElement>(null);
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  const isEmpty = !heading && !sub && !trailing;
  const resolvedTitleColor =
    (typeof titleStyle?.color === 'string' && titleStyle.color.trim()) || titleColor;
  const incomingFontStyle = titleStyle?.fontStyle;
  const restTitleStyle = omitHeaderTitleMetrics(titleStyle);
  const allowItalicWord = incomingFontStyle !== 'italic';
  const mark = accent || subtitleColor;
  const countLabel =
    typeof entryCount === 'number' && entryCount > 0
      ? String(entryCount).padStart(2, '0')
      : '';

  useEffect(() => {
    const header = headerRef.current;
    if (!header || isEmpty) return;

    if (prefersReducedMotion()) {
      showElementNow(header);
      return;
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      revealElement(header, 0);
    };

    const ioRoot = showcaseScrollRoot(header);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, root: ioRoot, rootMargin: '40px 0px' }
    );
    observer.observe(header);
    const failSafe = window.setTimeout(reveal, 1600);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [heading, sub, isEmpty]);

  if (isEmpty) return null;

  return (
    <header
      ref={headerRef}
      className={`mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-showcase-enter=""
      data-pf-no-color-transition=""
      style={SHOWCASE_HIDDEN}
    >
      <style dangerouslySetInnerHTML={{ __html: SHOWCASE_MOTION_CSS }} />
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span
              className="h-px w-7 shrink-0 sm:w-9"
              style={{ backgroundColor: mark, opacity: 0.7 }}
              aria-hidden
            />
            <p
              className="text-[10px] font-medium uppercase tracking-[0.28em] sm:text-[11px]"
              style={{ color: subtitleColor }}
            >
              {countLabel || 'Selected'}
            </p>
          </div>
          {heading ? (
            <h2
              className={titleClassName.trim() || 'font-semibold tracking-[-0.045em]'}
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.35rem, 5.6vw, 4.25rem)',
                lineHeight: 1.06,
              }}
            >
              {allowItalicWord ? <EditorialTitleText text={heading} /> : heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-md text-[15px] leading-[1.7] sm:text-base sm:leading-[1.75] ${
                heading ? 'mt-5' : ''
              }`}
              style={{ color: subtitleColor, opacity: 0.86 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? (
          <div className="flex shrink-0 flex-col items-end gap-3 pb-1">
            {trailing}
            <span
              className="hidden h-px w-16 sm:block lg:w-24"
              style={{ backgroundColor: mark, opacity: 0.35 }}
              aria-hidden
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}

/**
 * Showcase gallery — featured stage + sliding thumb window.
 * Geometry: media dominates; copy is typographic, not a magazine card.
 */
export function ProjectsShowcaseGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsShowcaseSettings(
    DEFAULT_PROJECTS_SHOWCASE_SETTINGS,
    presentation.projectsShowcase
  );
  const reduceMotion = useReducedMotion();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [itemCount, setItemCount] = useState(items.length);
  const [thumbAnim, setThumbAnim] = useState<{ from: number; dir: 1 | -1 } | null>(null);
  const [thumbStep, setThumbStep] = useState(0);
  const [thumbX, setThumbX] = useState(0);
  const [thumbTween, setThumbTween] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const thumbViewRef = useRef<HTMLDivElement>(null);
  const thumbTrackElRef = useRef<HTMLDivElement>(null);
  const thumbAnimRef = useRef<{ from: number; dir: 1 | -1 } | null>(null);
  const thumbTweenRef = useRef(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbFrameRef = useRef<number | null>(null);

  const thumbVisible = Math.min(3, Math.max(0, items.length - 1));
  const hGap = THUMB_GAP;
  const mediaOnLeft = (settings.mediaSide ?? 'left') === 'left';
  const safeIndex = clampShowcaseIndex(featuredIndex, items.length);

  if (itemCount !== items.length) {
    setItemCount(items.length);
    setFeaturedIndex((index) => clampShowcaseIndex(index, items.length));
    if (thumbAnim !== null) {
      setThumbTween(false);
      setThumbX(0);
      setThumbAnim(null);
    }
  }

  /** Snap track to rest without a second animated jump (kills end-of-slide palpitation). */
  const finishThumbAnim = () => {
    if (!thumbAnimRef.current) return;
    if (unlockTimer.current) {
      clearTimeout(unlockTimer.current);
      unlockTimer.current = null;
    }
    if (thumbFrameRef.current != null) {
      cancelAnimationFrame(thumbFrameRef.current);
      thumbFrameRef.current = null;
    }

    const el = thumbTrackElRef.current;
    if (el) {
      el.style.transition = 'none';
      el.style.transform = 'translate3d(0px, 0, 0)';
    }

    thumbAnimRef.current = null;
    thumbTweenRef.current = false;
    setThumbTween(false);
    setThumbX(0);
    setThumbAnim(null);
  };

  const thumbsAt = (start: number) =>
    Array.from({ length: thumbVisible }, (_, offset) => {
      const index = (start + 1 + offset) % items.length;
      return { item: items[index]!, index };
    });

  const thumbExtra = (start: number) => {
    const index = (start + 1 + thumbVisible) % items.length;
    return { item: items[index]!, index };
  };

  const thumbBaseIndex = clampShowcaseIndex(thumbAnim?.from ?? safeIndex, items.length);
  const thumbs = thumbsAt(thumbBaseIndex);
  const thumbTrack =
    thumbVisible === 0
      ? []
      : thumbAnim?.dir === -1
        ? [{ item: items[thumbBaseIndex]!, index: thumbBaseIndex }, ...thumbs]
        : [...thumbs, thumbExtra(thumbBaseIndex)];

  useEffect(() => {
    return () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
      if (thumbFrameRef.current != null) cancelAnimationFrame(thumbFrameRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (unlockTimer.current) {
      clearTimeout(unlockTimer.current);
      unlockTimer.current = null;
    }
    if (thumbFrameRef.current != null) {
      cancelAnimationFrame(thumbFrameRef.current);
      thumbFrameRef.current = null;
    }
    thumbAnimRef.current = null;
    thumbTweenRef.current = false;
    const el = thumbTrackElRef.current;
    if (el) {
      el.style.transition = 'none';
      el.style.transform = 'translate3d(0px, 0, 0)';
    }
  }, [items.length]);

  useLayoutEffect(() => {
    if (thumbVisible === 0) return;
    const node = thumbViewRef.current;
    if (!node) return;
    const update = () => {
      if (thumbAnimRef.current) return;
      const itemWidth = (node.clientWidth - (thumbVisible - 1) * hGap) / thumbVisible;
      const step = itemWidth + hGap;
      if (step > 0) {
        setThumbStep((current) => (Math.abs(current - step) > 0.25 ? step : current));
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [thumbVisible, hGap, items.length]);

  useLayoutEffect(() => {
    if (!thumbAnim || reduceMotion) return;
    const el = thumbTrackElRef.current;
    const node = thumbViewRef.current;
    const step =
      node && thumbVisible > 0 ? measureShowcaseThumbStep(node, thumbVisible, hGap) : thumbStep;
    if (step <= 0) return;

    let cancelled = false;

    if (thumbAnim.dir === 1) {
      if (el) {
        el.style.transition = 'none';
        el.style.transform = 'translate3d(0px, 0, 0)';
      }
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled || !thumbAnimRef.current || thumbAnimRef.current.dir !== 1) return;
          thumbTweenRef.current = true;
          setThumbTween(true);
          setThumbX(-step);
        });
      });
      thumbFrameRef.current = frame;
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
        thumbFrameRef.current = null;
      };
    }

    if (el) {
      el.style.transition = 'none';
      el.style.transform = `translate3d(${-step}px, 0, 0)`;
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || !thumbAnimRef.current || thumbAnimRef.current.dir !== -1) return;
        thumbTweenRef.current = true;
        setThumbTween(true);
        setThumbX(0);
      });
    });
    thumbFrameRef.current = frame;
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      thumbFrameRef.current = null;
    };
  }, [thumbAnim, reduceMotion, thumbVisible, thumbStep, hGap]);

  useEffect(() => {
    if (items.length < 2) return;
    const preload = (offset: number) => {
      const item = items[(featuredIndex + offset + items.length) % items.length];
      const url = item?.mediaUrl?.trim();
      if (!url) return;
      const image = new window.Image();
      image.src = url;
    };
    preload(1);
    preload(-1);
  }, [featuredIndex, items]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>('[data-showcase-enter]')];
    if (nodes.length === 0) return;

    if (prefersReducedMotion()) {
      nodes.forEach(showElementNow);
      return;
    }

    const ioRoot = showcaseScrollRoot(root);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.enterDelay) || 0;
          revealElement(el, delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.1, root: ioRoot, rootMargin: '48px 0px -6% 0px' }
    );
    nodes.forEach((node) => observer.observe(node));
    const failSafe = window.setTimeout(() => {
      nodes.forEach((node) => {
        if (node.dataset.revealed === 'true') return;
        revealElement(node, 0);
      });
    }, 1600);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [items.length, mediaOnLeft]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const desktopMq = window.matchMedia(SHOWCASE_DESKTOP_MQ);
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mediaEls = [...root.querySelectorAll<HTMLElement>('[data-showcase-media-shift]')];
    const copyEls = [...root.querySelectorAll<HTMLElement>('[data-showcase-copy-shift]')];

    let raf = 0;
    let ticking = false;
    let scrollTarget: EventTarget = window;

    const reset = () => {
      for (const el of mediaEls) {
        el.style.transform = '';
        el.style.willChange = 'auto';
      }
      for (const el of copyEls) {
        el.style.transform = '';
        el.style.willChange = 'auto';
      }
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

      const centered = (rect.top + rect.height * 0.5 - vh * 0.42) / vh;
      const clamped = Math.max(-1.1, Math.min(1.1, centered));
      const mediaY = (clamped * 26).toFixed(2);
      const copyY = (clamped * -12).toFixed(2);
      for (const el of mediaEls) {
        el.style.transform = `translate3d(0, ${mediaY}px, 0)`;
      }
      for (const el of copyEls) {
        el.style.transform = `translate3d(0, ${copyY}px, 0)`;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(apply);
    };

    const unbind = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      ticking = false;
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    const bind = () => {
      unbind();
      if (!desktopMq.matches || reduceMq.matches) {
        reset();
        return;
      }
      for (const el of mediaEls) el.style.willChange = 'transform';
      for (const el of copyEls) el.style.willChange = 'transform';
      scrollTarget = showcaseScrollRoot(root) ?? window;
      scrollTarget.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      apply();
    };

    bind();
    desktopMq.addEventListener('change', bind);
    reduceMq.addEventListener('change', bind);

    return () => {
      unbind();
      reset();
      desktopMq.removeEventListener('change', bind);
      reduceMq.removeEventListener('change', bind);
    };
  }, [items.length, mediaOnLeft]);

  if (items.length === 0) return null;

  const active = items[safeIndex]!;
  const ink = presentation.titleColor;
  const muted = presentation.subtitleColor;
  const border = presentation.cardBorderColor || muted;
  const radiusClass = showcaseRadiusClass(settings.mediaRadius ?? 'xl');
  const busy = Boolean(thumbAnim);

  /** Same cycle as Gallery tall-row: next promotes first thumb into the hero. */
  const cycle = (direction: -1 | 1) => {
    if (items.length < 2) return;
    if (thumbAnimRef.current) return;

    const from = safeIndex;
    const node = thumbViewRef.current;
    const step =
      node && thumbVisible > 0 ? measureShowcaseThumbStep(node, thumbVisible, hGap) : thumbStep;
    if (step > 0 && Math.abs(step - thumbStep) > 0.25) setThumbStep(step);

    setFeaturedIndex((current) =>
      clampShowcaseIndex(clampShowcaseIndex(current, items.length) + direction, items.length)
    );

    if (reduceMotion || thumbVisible === 0 || step <= 0) return;

    const nextAnim = { from, dir: direction };
    thumbAnimRef.current = nextAnim;
    thumbTweenRef.current = false;
    setThumbTween(false);
    setThumbX(direction === 1 ? 0 : -step);
    setThumbAnim(nextAnim);

    if (unlockTimer.current) clearTimeout(unlockTimer.current);
    unlockTimer.current = setTimeout(() => {
      finishThumbAnim();
    }, SHOWCASE_SLIDE_MS + 48);
  };

  /** Click a visible thumb → advance until that project is featured (same slide feel). */
  const selectThumb = (targetIndex: number) => {
    if (targetIndex === safeIndex || items.length < 2 || thumbAnimRef.current) return;
    const nextIndex = (safeIndex + 1) % items.length;
    const prevIndex = (safeIndex - 1 + items.length) % items.length;
    if (targetIndex === nextIndex) {
      cycle(1);
      return;
    }
    if (targetIndex === prevIndex) {
      cycle(-1);
      return;
    }
    const forwardSteps = (targetIndex - safeIndex + items.length) % items.length;
    const backwardSteps = (safeIndex - targetIndex + items.length) % items.length;
    cycle(forwardSteps <= backwardSteps ? 1 : -1);
  };

  const media = (
    <div
      className="min-h-0 min-w-0 overflow-hidden lg:h-full"
      data-showcase-enter=""
      data-enter-delay="40"
      data-pf-no-color-transition=""
      style={SHOWCASE_HIDDEN}
    >
      <div className="h-full" data-showcase-media-shift="">
        <ShowcasePrimaryMedia
          item={active}
          presentation={presentation}
          settings={settings}
          reduceMotion={reduceMotion}
        />
      </div>
    </div>
  );

  const thumbStrip =
    thumbTrack.length === 0 ? null : (
      <div
        ref={thumbViewRef}
        className="w-full overflow-hidden [container-type:inline-size]"
        aria-label="Project thumbnails"
      >
        <div
          ref={thumbTrackElRef}
          className="flex transform-gpu will-change-transform"
          role="list"
          style={{
            gap: hGap,
            transform: `translate3d(${thumbX}px, 0, 0)`,
            transition:
              thumbTween && !reduceMotion
                ? `transform ${SHOWCASE_SLIDE_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`
                : 'none',
          }}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.propertyName !== 'transform') return;
            if (!thumbAnimRef.current || !thumbTweenRef.current) return;
            finishThumbAnim();
          }}
        >
          {thumbTrack.map(({ item, index }) => {
            const mediaUrl = item.mediaUrl?.trim() || null;
            const label = item.title?.trim() || `Project ${index + 1}`;
            return (
              <button
                key={`${item.id}-${index}`}
                type="button"
                role="listitem"
                aria-label={`Show ${label}`}
                onClick={() => selectThumb(index)}
                disabled={busy}
                className={`relative aspect-[4/5] overflow-hidden opacity-[0.72] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-100 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-current disabled:pointer-events-none ${radiusClass}`}
                style={{
                  backgroundColor: `${border}28`,
                  flex: `0 0 ${
                    thumbStep > 0
                      ? `${Math.max(0, thumbStep - hGap)}px`
                      : `calc((100cqi - ${(thumbVisible - 1) * hGap}px) / ${Math.max(1, thumbVisible)})`
                  }`,
                }}
                data-pf-no-color-transition=""
              >
                {mediaUrl ? (
                  <Image
                    src={mediaUrl}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 30vw, 12vw"
                    className="object-cover object-center"
                    draggable={false}
                    data-pf-no-color-transition=""
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );

  const details = (
    <div className="flex h-full min-h-0 w-full flex-col justify-start">
      <div
        className="shrink-0"
        data-showcase-enter=""
        data-enter-delay="120"
        data-showcase-copy-shift=""
        data-pf-no-color-transition=""
        style={SHOWCASE_HIDDEN}
      >
        <motion.div
          key={active.id}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <ShowcaseDetails
            item={active}
            index={safeIndex}
            total={items.length}
            presentation={presentation}
            settings={settings}
          />
        </motion.div>
      </div>

      <div
        className="mt-10 flex shrink-0 flex-col gap-6 sm:mt-12 sm:gap-7 lg:mt-auto lg:pt-12"
        data-showcase-enter=""
        data-enter-delay="220"
        data-pf-no-color-transition=""
        style={SHOWCASE_HIDDEN}
      >
        {items.length > 1 ? (
          <div className="flex items-center gap-1">
            <ShowcaseChevron
              direction="prev"
              onClick={() => cycle(-1)}
              label="Previous project"
              color={ink}
              disabled={busy}
            />
            <p
              className="min-w-[4.75rem] px-1 text-center text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]"
              style={{ color: muted }}
              aria-hidden
              data-pf-no-color-transition=""
            >
              {formatShowcaseIndex(safeIndex)}
              <span className="mx-1.5" style={{ opacity: 0.4 }}>
                /
              </span>
              {formatShowcaseIndex(items.length - 1)}
            </p>
            <ShowcaseChevron
              direction="next"
              onClick={() => cycle(1)}
              label="Next project"
              color={ink}
              disabled={busy}
            />
          </div>
        ) : null}
        {thumbStrip}
      </div>
    </div>
  );

  return (
    <section
      ref={rootRef}
      className="w-full"
      aria-label="Project showcase"
      data-pf-no-color-transition=""
    >
      <style dangerouslySetInnerHTML={{ __html: SHOWCASE_MOTION_CSS }} />
      <p className="sr-only">
        Project {safeIndex + 1} of {items.length}
        {active.title?.trim() ? `: ${active.title.trim()}` : ''}
      </p>
      <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)] lg:items-stretch lg:gap-x-16 xl:gap-x-24">
        <div
          className={`min-w-0 lg:self-stretch ${
            mediaOnLeft ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-2 lg:row-start-1'
          }`}
        >
          {media}
        </div>
        <div
          className={`flex min-h-0 min-w-0 flex-col lg:self-stretch ${
            mediaOnLeft ? 'lg:col-start-2 lg:row-start-1' : 'lg:col-start-1 lg:row-start-1'
          }`}
        >
          {details}
        </div>
      </div>
    </section>
  );
}

export function isProjectsShowcaseDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-showcase';
}
