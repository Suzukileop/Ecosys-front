'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsShowcaseNavHover,
  PortfolioWorkProjectsShowcaseRadius,
  PortfolioWorkProjectsShowcaseSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_SHOWCASE_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsShowcaseSettings,
} from '@/components/portfolio/portfolio-work-settings';
import { useT } from '@/lib/i18n/I18nProvider';

/** Same timing / easing principle as Gallery → Image haute + rangée. */
const SHOWCASE_SLIDE_MS = 620;
const THUMB_GAP = 12;
const SHOWCASE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SHOWCASE_DESKTOP_MQ = '(min-width: 1024px)';
const SWIPE_TRIGGER_PX = 46;
const SWIPE_AXIS_LOCK_PX = 8;
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
.pf-showcase-mobile-thumbs {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.pf-showcase-mobile-thumbs::-webkit-scrollbar {
  display: none;
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

function EditorialTitleText({ text, italic = true }: { text: string; italic?: boolean }) {
  const parts = italic ? splitEditorialTitle(text) : null;
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.lead}{' '}
      <span className="font-medium italic tracking-[-0.03em]">{parts.italic}</span>
    </>
  );
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

/** Best-effort average color of an image, sampled off a tiny offscreen canvas. Silently gives
 * up on cross-origin sources without permissive CORS headers — the ambient wash is a bonus,
 * never a requirement. */
function useShowcaseAmbientColor(mediaUrl: string | null): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaUrl) return undefined;
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 12;
        canvas.height = 12;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 12, 12);
        const { data } = ctx.getImageData(0, 0, 12, 12);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]!;
          g += data[i + 1]!;
          b += data[i + 2]!;
          n += 1;
        }
        if (n > 0 && !cancelled) {
          setColor(`rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`);
        }
      } catch {
        // Tainted canvas (no CORS) — leave the ambient wash at its previous/neutral state.
      }
    };
    img.onerror = () => {};
    img.src = mediaUrl;
    return () => {
      cancelled = true;
    };
  }, [mediaUrl]);

  return color;
}

/** Native (non-passive) touch listeners so a confirmed horizontal drag can call
 * preventDefault and stay a swipe instead of also scrolling the page underneath it —
 * React's synthetic touch handlers are passive by default and can't do that. Axis is
 * locked from the first few pixels of movement so a vertical scroll is never hijacked. */
function useShowcaseSwipe(
  elRef: RefObject<HTMLElement | null>,
  onSwipe: (direction: 1 | -1) => void,
  disabled: boolean
) {
  const onSwipeRef = useRef(onSwipe);
  useLayoutEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    const el = elRef.current;
    if (!el || disabled) return undefined;

    let startX = 0;
    let startY = 0;
    let axis: 'x' | 'y' | null = null;

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      axis = null;
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < SWIPE_AXIS_LOCK_PX && Math.abs(dy) < SWIPE_AXIS_LOCK_PX) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (axis === 'x' && event.cancelable) event.preventDefault();
    };

    const onEnd = (event: TouchEvent) => {
      const wasHorizontal = axis === 'x';
      const touch = event.changedTouches[0];
      axis = null;
      if (!wasHorizontal || !touch) return;
      const dx = touch.clientX - startX;
      if (Math.abs(dx) < SWIPE_TRIGGER_PX) return;
      onSwipeRef.current(dx < 0 ? 1 : -1);
    };

    const onCancel = () => {
      axis = null;
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  }, [elRef, disabled]);
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

/** Ring that fades in and tracks the pointer within the nav cluster — a local "cursor grows as
 * it approaches" cue, contained to this control instead of replacing the OS cursor globally. */
function ShowcaseNavAura({
  children,
  color,
  mode,
}: {
  children: ReactNode;
  color: string;
  mode: PortfolioWorkProjectsShowcaseNavHover;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0, transform: 'translate3d(-50%, -50%, 0) scale(0.4)' });

  const handleMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (mode !== 'aura') return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setStyle({ opacity: 1, transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(1)` });
  };
  const handleLeave = () => setStyle((prev) => ({ ...prev, opacity: 0 }));

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center gap-1"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {mode === 'aura' ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-9 w-9 rounded-full border transition-[opacity,transform,translate,scale,rotate] duration-300 ease-out"
          style={{ borderColor: color, ...style }}
        />
      ) : null}
      {children}
    </div>
  );
}

/** Magnetic pull strength/reach — button translates toward the cursor while hovered. */
const MAGNETIC_STRENGTH = 0.35;
const MAGNETIC_MAX_PX = 10;

function ShowcaseChevron({
  direction,
  onClick,
  label,
  color,
  disabled,
  touchSize = false,
  circled = false,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  label: string;
  color: string;
  disabled?: boolean;
  /** Projects showcase → Arrows "Circle": a fixed hairline ring around the glyph. */
  circled?: boolean;
  /** Widens the hit area to a comfortable thumb target (48px) without enlarging the
   * glyph itself — the graphic stays as thin/discreet as the desktop version. */
  touchSize?: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const magneticFrame = useRef<number | null>(null);

  const handleMouseMove = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    const x = Math.max(-MAGNETIC_MAX_PX, Math.min(MAGNETIC_MAX_PX, relX * MAGNETIC_STRENGTH));
    const y = Math.max(-MAGNETIC_MAX_PX, Math.min(MAGNETIC_MAX_PX, relY * MAGNETIC_STRENGTH));
    if (magneticFrame.current) cancelAnimationFrame(magneticFrame.current);
    magneticFrame.current = requestAnimationFrame(() => {
      buttonRef.current?.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`);
    });
  };

  const handleMouseLeave = () => {
    if (magneticFrame.current) cancelAnimationFrame(magneticFrame.current);
    buttonRef.current?.style.setProperty('transform', 'translate3d(0, 0, 0)');
  };

  useEffect(
    () => () => {
      if (magneticFrame.current) cancelAnimationFrame(magneticFrame.current);
    },
    []
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-disabled={disabled || undefined}
      aria-label={label}
      data-pf-no-color-transition=""
      className={`relative z-[1] inline-flex items-center justify-center transition-[opacity,transform,translate,scale,rotate] duration-200 ease-out hover:opacity-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-current active:opacity-40 ${
        touchSize ? 'h-12 w-12' : 'h-9 w-9'
      } ${circled ? 'rounded-full border' : 'rounded-xs'}`}
      style={circled ? { color, borderColor: `color-mix(in srgb, ${color} 45%, transparent)` } : { color }}
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
  direction,
  variant = 'desktop',
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsShowcaseSettings;
  reduceMotion: boolean | null;
  direction: 1 | -1;
  /** 'mobile' renders full-bleed edge-to-edge (no card radius/aspect ratio, fills its
   * parent's own height instead) for the immersive sub-768px layout; the role chip is
   * skipped since the overlapping title covers that ground on that layout. */
  variant?: 'desktop' | 'mobile';
}) {
  const t = useT();
  const mediaUrl = item.mediaUrl?.trim() || null;
  const muted = presentation.subtitleColor;
  const border = presentation.cardBorderColor || muted;
  const radiusClass = showcaseRadiusClass(settings.mediaRadius ?? 'xl');
  const href = item.linkUrl?.trim() || null;
  const title = item.title?.trim() || t('Project');
  const role = workRoleLabel(item);
  const showRole = variant === 'desktop' && settings.showRole !== false && Boolean(role);
  const sizes = variant === 'mobile' ? '100vw' : '(max-width: 1024px) 100vw, 58vw';

  const imageClass = `object-cover object-center ${
    reduceMotion
      ? ''
      : 'transition-transform duration-[1.15s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/media:scale-[1.035]'
  }`;

  const mediaNode = mediaUrl ? (
    href ? (
      <ShowcaseHref href={href} className="absolute inset-0" ariaLabel={t('Open {title}', { title })}>
        <span className="relative block h-full w-full">
          <Image
            src={mediaUrl}
            alt={title}
            fill
            sizes={sizes}
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
        sizes={sizes}
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
      {t('Add a thumbnail in Information → Portfolio')}
    </div>
  );

  // Directional mask wipe: the incoming frame reveals from the side it travels in from while
  // scaling down to rest; the outgoing frame wipes away toward the same direction of travel.
  const hiddenClip = direction === 1 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
  const exitClip = direction === 1 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)';

  return (
    <figure
      className={
        variant === 'mobile'
          ? 'group/media relative h-full w-full overflow-hidden'
          : `group/media relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[36rem] ${radiusClass}`
      }
      style={{ backgroundColor: `${border}28` }}
      data-pf-no-color-transition=""
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={item.id}
          className="absolute inset-0"
          initial={reduceMotion ? false : { clipPath: hiddenClip, scale: 1.09 }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
          exit={reduceMotion ? undefined : { clipPath: exitClip, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          {mediaNode}
        </motion.div>
      </AnimatePresence>

      {showRole ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-7">
          {/* Dark chip, not bare white text: on a bright photo the text-shadow left the role
              at ~1.1:1. */}
          <p
            className="w-fit rounded-sm bg-black/55 px-2 py-1 text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-[#f7f7f7] backdrop-blur-sm sm:text-[11px]"
            data-pf-no-color-transition=""
          >
            {role}
          </p>
        </div>
      ) : null}
    </figure>
  );
}

/** Title as a word-level "text-split reveal": on project change, the current words slide up and
 * out, then the new title's words slide up into place, staggered left to right. */
function ShowcaseTitleReveal({
  title,
  href,
  activeId,
  titleColor,
  reduceMotion,
  italic = true,
}: {
  title: string;
  href: string | null;
  activeId: string;
  titleColor: string;
  reduceMotion: boolean | null;
  /** Projects showcase → "Italic last word"; false renders the title as typed. */
  italic?: boolean;
}) {
  if (!title) return null;

  if (reduceMotion) {
    return href ? (
      <ShowcaseHref
        href={href}
        className="rounded-xs outline-hidden transition-opacity duration-500 hover:opacity-70 focus-visible:opacity-70"
      >
        <EditorialTitleText text={title} italic={italic} />
      </ShowcaseHref>
    ) : (
      <EditorialTitleText text={title} italic={italic} />
    );
  }

  const words = title.trim().split(/\s+/).filter(Boolean);
  const parts = italic ? splitEditorialTitle(title) : null;
  const italicLastIndex = parts ? words.length - 1 : -1;

  // Each word's mask gets a little inline-end room (cancelled by the negative margin): it
  // clipped the italic overhang, cutting the last letter ("marketplac|e").
  const track = (
    <AnimatePresence mode="wait" initial={false}>
      {words.map((word, i) => (
        <span
          key={`${activeId}-${i}`}
          className="-me-[0.12em] inline-block overflow-hidden pb-[0.14em] pe-[0.12em] align-bottom"
        >
          <motion.span
            className={`inline-block ${i === italicLastIndex ? 'font-medium italic tracking-[-0.03em]' : ''}`}
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-105%' }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: i * 0.045 }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </AnimatePresence>
  );

  return href ? (
    <ShowcaseHref
      href={href}
      className="rounded-xs outline-hidden transition-opacity duration-500 hover:opacity-70 focus-visible:opacity-70"
      style={{ color: titleColor }}
    >
      {track}
    </ShowcaseHref>
  ) : (
    track
  );
}

function ShowcaseDetails({
  item,
  index,
  total,
  presentation,
  settings,
  reduceMotion,
  hideTitle = false,
  hideIndex = false,
  compact = false,
}: {
  item: MarketplaceContentItem;
  index: number;
  total: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsShowcaseSettings;
  reduceMotion: boolean | null;
  /** Mobile layout renders the massive title separately, overlapping the media — this
   * skips it here so it isn't duplicated. */
  hideTitle?: boolean;
  /** Immersive layout: its nav row already shows "01 / 06", so a second counter here is noise. */
  hideIndex?: boolean;
  /** Mobile layout: description and tags shrink further and sit closer together —
   * "very discreet, very thin" per the immersive full-width redesign. */
  compact?: boolean;
}) {
  const t = useT();
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;
  const title = item.title?.trim() || '';
  const description = item.description?.trim() || '';
  const category = workCategoryLabel(item);
  const href = item.linkUrl?.trim() || null;
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showCategory = settings.showCategory !== false && Boolean(category);
  const categoryLabel = settings.categoryLabel?.trim() || t('Category');
  const showTitle = !hideTitle && Boolean(title);

  return (
    <div className="min-w-0" aria-live="polite" aria-atomic="true">
      {total > 0 && !hideIndex && settings.showIndex !== false ? (
        <p
          className={`flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] ${
            compact ? 'mb-4' : 'mb-6 sm:mb-7 sm:text-[12px]'
          }`}
          style={{ color: muted }}
          data-pf-no-color-transition=""
        >
          <span style={{ color: accent }}>{formatShowcaseIndex(index)}</span>
          <span
            className="h-px w-7 shrink-0 sm:w-9"
            style={{ backgroundColor: accent, opacity: 0.55 }}
            aria-hidden
          />
          <span style={{ opacity: 0.85 }}>{formatShowcaseIndex(total - 1)}</span>
        </p>
      ) : null}

      {showTitle ? (
        <h3
          className="relative max-w-xl text-[2.15rem] font-semibold tracking-[-0.045em] sm:text-[2.7rem] lg:text-[3.25rem] lg:leading-[1.04]"
          style={{ color: titleColor }}
          data-pf-no-color-transition=""
        >
          <ShowcaseTitleReveal
            title={title}
            href={href}
            activeId={item.id}
            titleColor={titleColor}
            reduceMotion={reduceMotion}
            italic={settings.titleItalic === true}
          />
        </h3>
      ) : null}

      {showDescription ? (
        <p
          className={
            compact
              ? `max-w-[26rem] text-[0.9375rem] leading-[1.65] ${title ? 'mt-1' : ''}`
              : `max-w-[26rem] text-[0.9375rem] leading-[1.7] sm:text-[0.98rem] lg:text-base lg:leading-[1.7] ${
                  showTitle ? 'mt-6 sm:mt-7' : ''
                }`
          }
          style={{ color: muted }}
          data-pf-no-color-transition=""
        >
          {description}
        </p>
      ) : null}

      {showCategory ? (
        <div
          className={
            compact ? 'mt-5' : `${showTitle || showDescription ? 'mt-9 sm:mt-10' : ''}`
          }
          data-pf-no-color-transition=""
        >
          <p
            className={`font-medium uppercase tracking-[0.22em] ${
              compact ? 'text-[11px]' : 'text-[11px] sm:text-[12px]'
            }`}
            style={{ color: muted, opacity: 0.88 }}
          >
            {categoryLabel}
          </p>
          <p
            className={compact ? 'mt-1.5 text-[0.8rem] tracking-[-0.01em]' : 'mt-2.5 text-sm tracking-[-0.015em] sm:text-[0.95rem]'}
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
  const t = useT();
  const settings = mergeProjectsShowcaseSettings(
    DEFAULT_PROJECTS_SHOWCASE_SETTINGS,
    presentation.projectsShowcase
  );
  const reduceMotion = useReducedMotion();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [mediaDir, setMediaDir] = useState<1 | -1>(1);
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
  const mobileMediaRef = useRef<HTMLDivElement>(null);
  const suppressTapRef = useRef(false);
  const suppressTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (suppressTapTimer.current) clearTimeout(suppressTapTimer.current);
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

  const ambientColor = useShowcaseAmbientColor(items[safeIndex]?.mediaUrl?.trim() || null);

  /** Same cycle as Gallery tall-row: next promotes first thumb into the hero. Defined
   * above the empty-state return so the swipe hook below (a hook — must run unconditionally
   * every render) can close over it. */
  const cycle = (direction: -1 | 1) => {
    if (items.length < 2) return;
    if (thumbAnimRef.current) return;

    const from = safeIndex;
    const node = thumbViewRef.current;
    const step =
      node && thumbVisible > 0 ? measureShowcaseThumbStep(node, thumbVisible, hGap) : thumbStep;
    if (step > 0 && Math.abs(step - thumbStep) > 0.25) setThumbStep(step);

    setMediaDir(direction);
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

  // Touch swipe on the mobile full-bleed media: a confirmed horizontal drag advances the
  // gallery the same way the desktop chevrons do, briefly suppressing the image's own tap
  // link so a swipe release near the start point never also fires a navigation click.
  useShowcaseSwipe(
    mobileMediaRef,
    (direction) => {
      suppressTapRef.current = true;
      if (suppressTapTimer.current) clearTimeout(suppressTapTimer.current);
      suppressTapTimer.current = setTimeout(() => {
        suppressTapRef.current = false;
      }, 400);
      cycle(direction);
    },
    items.length < 2 || Boolean(thumbAnim)
  );

  if (items.length === 0) return null;

  const active = items[safeIndex]!;
  const ink = presentation.titleColor;
  const muted = presentation.subtitleColor;
  const border = presentation.cardBorderColor || muted;
  const thumbRadiusClass = showcaseRadiusClass(settings.thumbRadius ?? 'none');
  // Small mobile chips: the desktop radius scale (up to 2rem) would turn them into pills.
  const mobileThumbRadiusClass =
    settings.thumbRadius === 'xl' ? 'rounded-lg' : settings.thumbRadius === 'md' ? 'rounded-[4px]' : 'rounded-none';
  const navHover = settings.navHover ?? 'aura';
  const showCounter = settings.showCounter !== false;
  const busy = Boolean(thumbAnim);

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
          direction={mediaDir}
        />
      </div>
    </div>
  );

  const thumbStrip =
    thumbTrack.length === 0 ? null : (
      <div
        ref={thumbViewRef}
        data-showcase-thumb-strip=""
        className="w-full overflow-hidden [container-type:inline-size]"
        aria-label={t('Project thumbnails')}
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
                aria-label={t('Show {label}', { label })}
                onClick={() => selectThumb(index)}
                aria-disabled={busy || undefined}
                data-showcase-thumb=""
                className={`group/thumb relative block aspect-[4/5] overflow-hidden opacity-[0.86] transition-opacity duration-300 ease-out hover:opacity-100 focus:outline-hidden focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-current ${thumbRadiusClass}`}
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
                    loading="eager"
                    className="object-cover object-center transition-transform duration-[6000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/thumb:scale-[1.12]"
                    draggable={false}
                    data-pf-no-color-transition=""
                  />
                ) : null}
                {/* No label over the image: it covered the bottom of every thumb. The name
                    stays in aria-label for assistive tech. */}
              </button>
            );
          })}
        </div>
      </div>
    );

  const details = (
    <div className="flex h-full min-h-0 w-full flex-col justify-start">
      <div
        className="grid shrink-0"
        data-showcase-enter=""
        data-enter-delay="120"
        data-showcase-copy-shift=""
        data-pf-no-color-transition=""
        style={SHOWCASE_HIDDEN}
      >
        {/* Invisible copies of every project's copy stacked in the same cell: the cell (and so
            the row, the media and the thumb strip) always takes the tallest project's height,
            instead of growing/shrinking by a line on each switch. */}
        {items.map((item, index) => (
          <div key={item.id} className="invisible [grid-area:1/1]" aria-hidden>
            <ShowcaseDetails
              item={item}
              index={index}
              total={items.length}
              presentation={presentation}
              settings={settings}
              reduceMotion
            />
          </div>
        ))}
        <motion.div
          key={active.id}
          className="[grid-area:1/1]"
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
            reduceMotion={reduceMotion}
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
          <ShowcaseNavAura color={ink} mode={navHover}>
            <ShowcaseChevron
              direction="prev"
              onClick={() => cycle(-1)}
              label={t('Previous project')}
              color={ink}
              disabled={busy}
              circled={navHover === 'circle'}
            />
            {showCounter ? (
              <p
                className="min-w-[4.75rem] px-1 text-center text-[11px] font-medium uppercase tracking-[0.18em] sm:text-[12px]"
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
            ) : (
              <span className="w-2" aria-hidden />
            )}
            <ShowcaseChevron
              direction="next"
              onClick={() => cycle(1)}
              label={t('Next project')}
              color={ink}
              disabled={busy}
              circled={navHover === 'circle'}
            />
          </ShowcaseNavAura>
        ) : null}
        {thumbStrip}
      </div>
    </div>
  );

  // Full-width immersive layout for phones AND tablets (< 1024px): stacked, edge-to-edge, the
  // title pulled up to overlap the image/background seam, swipe-driven instead of the desktop
  // chevron rail + windowed thumb track. Tablets used to get the desktop tree stacked in one
  // column: a 4:5 image ~830px tall, Prev/Next ~400px below it, three 270px thumbs competing
  // with the hero — ~2000px for one project. Kept as a separate tree (toggled with the
  // desktop grid via `hidden`/`lg:hidden`): the two layouts are too different to share.
  // Order: content first (title, copy, link), then ONE browse block (arrows + counter + strip).
  const mobileGallery = (
    <div className="lg:hidden">
      <div
        ref={mobileMediaRef}
        className="relative mx-[calc(50%-50vw)] h-[50vh] min-h-[20rem] w-screen overflow-hidden md:h-[58vh] md:max-h-[40rem]"
        data-pf-no-color-transition=""
        onClickCapture={(event) => {
          if (!suppressTapRef.current) return;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <ShowcasePrimaryMedia
          item={active}
          presentation={presentation}
          settings={settings}
          reduceMotion={reduceMotion}
          direction={mediaDir}
          variant="mobile"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 48%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative z-[1] -mt-16 px-1 md:-mt-20">
        {active.title?.trim() ? (
          <h3
            className="max-w-[16ch] font-semibold tracking-[-0.045em] md:max-w-[20ch]"
            style={{
              fontSize: 'clamp(2.35rem, 11vw, 3.35rem)',
              lineHeight: 0.98,
              color: '#fbfbfb',
              textShadow: '0 14px 36px rgba(0,0,0,0.55)',
            }}
            data-pf-no-color-transition=""
          >
            <ShowcaseTitleReveal
              title={active.title.trim()}
              href={null}
              activeId={active.id}
              titleColor="#fbfbfb"
              reduceMotion={reduceMotion}
              italic={settings.titleItalic === true}
            />
          </h3>
        ) : null}

        <motion.div
          key={active.id}
          className="mt-6 md:max-w-xl"
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
            reduceMotion={reduceMotion}
            hideTitle
            hideIndex
            compact
          />
        </motion.div>

        {/* The project's own action sits with its copy, not after the whole browse block. */}
        {active.linkUrl?.trim() ? (
          <ShowcaseHref
            href={active.linkUrl.trim()}
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em]"
            style={{ color: ink }}
            ariaLabel={`Open ${active.title?.trim() || 'project'}`}
          >
            {t('Tap to Explore')}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="h-3 w-3"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
            </svg>
          </ShowcaseHref>
        ) : null}

        {items.length > 1 ? (
          <div
            className="mt-8 flex items-center justify-between border-t pt-4 md:mt-10"
            style={{ borderColor: `color-mix(in srgb, ${muted} 22%, transparent)` }}
          >
            <ShowcaseChevron
              direction="prev"
              onClick={() => cycle(-1)}
              label={t('Previous project')}
              color={muted}
              disabled={busy}
              touchSize
            />
            {showCounter ? (
              <p
                className="px-1 text-[11px] font-medium uppercase tracking-[0.18em]"
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
            ) : null}
            <ShowcaseChevron
              direction="next"
              onClick={() => cycle(1)}
              label={t('Next project')}
              color={muted}
              disabled={busy}
              touchSize
            />
          </div>
        ) : null}

        {items.length > 1 ? (
          <div
            className="pf-showcase-mobile-thumbs -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 md:gap-3"
            style={{ scrollSnapType: 'x proximity' }}
            role="list"
            aria-label={t('Project thumbnails')}
          >
            {items.map((item, idx) => {
              const thumbUrl = item.mediaUrl?.trim() || null;
              const label = item.title?.trim() || `Project ${idx + 1}`;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  onClick={() => selectThumb(idx)}
                  disabled={busy}
                  aria-label={t('Show {label}', { label })}
                  aria-current={idx === safeIndex}
                  /* Larger targets (64×44 was below a comfortable thumb size) and dimmed only
                     to 0.65: at 0.4 the strip read as a row of black boxes. */
                  className={`relative h-14 w-20 shrink-0 overflow-hidden transition-opacity duration-300 disabled:pointer-events-none md:h-20 md:w-28 ${mobileThumbRadiusClass}`}
                  style={{
                    scrollSnapAlign: 'center',
                    opacity: idx === safeIndex ? 1 : 0.65,
                    boxShadow: idx === safeIndex ? `0 0 0 1px ${ink}99 inset` : 'none',
                    backgroundColor: `${border}28`,
                  }}
                  data-pf-no-color-transition=""
                >
                  {thumbUrl ? (
                    <Image
                      src={thumbUrl}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 80px, 112px"
                      className="object-cover object-center"
                      draggable={false}
                      data-pf-no-color-transition=""
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full"
      aria-label={t('Project showcase')}
      data-pf-no-color-transition=""
    >
      <style dangerouslySetInnerHTML={{ __html: SHOWCASE_MOTION_CSS }} />
      {/* Ambient wash — a soft, local color echo of the active project's image. Anchored near
          the image itself and faded out well before the copy column, so it never reads as a
          tint over the text; scoped to this section, the site's own background is separate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16] blur-3xl transition-[background] duration-[1400ms] ease-out"
        style={{
          background: ambientColor
            ? `radial-gradient(ellipse 55% 65% at 20% 45%, ${ambientColor}, transparent 68%)`
            : 'transparent',
        }}
      />
      <p className="sr-only">
        {t('Project')} {safeIndex + 1} {t('of')} {items.length}
        {active.title?.trim() ? `: ${active.title.trim()}` : ''}
      </p>
      {mobileGallery}
      {/* Fixed row floor: the media took the row's height, and the row followed the details
          column — a 1-line vs 2-line title resized the image and moved the strip by ~54px on
          every project change. The floor sits above the tallest usual details column, so the
          stage stays put; only unusually long copy can still grow it. */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)] lg:grid-rows-[minmax(46rem,auto)] lg:items-stretch lg:gap-x-16 xl:grid-rows-[minmax(43rem,auto)] xl:gap-x-24">
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
