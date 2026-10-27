'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
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
import { useT } from '@/lib/i18n/I18nProvider';

const CAROUSEL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
/**
 * Two feels for the same strip, picked through CSS variables on the track.
 *  - Prev / Next / keys start from rest: an ease-OUT curve has its top speed on the very first frame,
 *    which is the kick that read as brutal. They use a gentle ease-in-out that accelerates first.
 *  - Releasing a drag already has momentum: starting from rest there would hitch, so it keeps an
 *    ease-out that carries the finger's speed on.
 */
const CAROUSEL_NAV_EASE = 'cubic-bezier(0.4, 0, 0.15, 1)';
const CAROUSEL_NAV_MS = 560;
const CAROUSEL_RELEASE_EASE = 'cubic-bezier(0.22, 0.7, 0.2, 1)';
const CAROUSEL_RELEASE_MS = 460;
const CAROUSEL_SNAP_MS = CAROUSEL_NAV_MS;
const CAROUSEL_FOCUS_MS = 520;
const CAROUSEL_TRACK_TRANSITION = `transform var(--carousel-dur, ${CAROUSEL_NAV_MS}ms) var(--carousel-ease, ${CAROUSEL_NAV_EASE})`;

function setTrackEase(track: HTMLElement | null | undefined, kind: 'nav' | 'release'): void {
  if (!track) return;
  track.style.setProperty('--carousel-ease', kind === 'nav' ? CAROUSEL_NAV_EASE : CAROUSEL_RELEASE_EASE);
  track.style.setProperty('--carousel-dur', `${kind === 'nav' ? CAROUSEL_NAV_MS : CAROUSEL_RELEASE_MS}ms`);
}
const DRAG_THRESHOLD_PX = 8;
const DESKTOP_MQ = '(min-width: 768px)';

const ENTER_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 22px, 0)',
};

/** The caption under the strip fades its new project in instead of swapping text in one frame. */
const CAPTION_FADE: CSSProperties = { animation: 'pf-workspace-panel-in 380ms cubic-bezier(0.4, 0, 0.2, 1) both' };

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
      <span className="font-medium tracking-[-0.03em]">{parts.italic}</span>
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
  centerOffsetPx: number;
  loopCopies: number;
  focusHeadroomPx: number;
};

function useCarouselSlideMetrics(
  viewportRef: RefObject<HTMLDivElement | null>,
  itemCount: number,
  imageSize: PortfolioWorkProjectsCarouselImageSize,
  gap: PortfolioWorkProjectsCarouselSettings['gap'],
  desktopFocus: 'first' | 'center'
): SlideMetrics {
  const [metrics, setMetrics] = useState<SlideMetrics>({ stepPx: 0, maxIndex: 0, centerOffsetPx: 0, loopCopies: 1, focusHeadroomPx: 0 });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || itemCount === 0) {
      setMetrics({ stepPx: 0, maxIndex: 0, centerOffsetPx: 0, loopCopies: 1, focusHeadroomPx: 0 });
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
      // Measure the original sequence only; loop copies must not create overflow.
      const overflow = Math.max(0, itemCount * first.offsetWidth + Math.max(0,itemCount-1) * gapPx - viewport.clientWidth);
      const centered = desktopFocus === 'center' && window.matchMedia('(min-width: 1024px)').matches;
      const maxIndex = centered ? Math.max(0,itemCount-1) :
        stepPx > 0 ? Math.max(0, Math.min(itemCount - 1, Math.ceil(overflow / stepPx - 0.01))) : 0;
      const centerOffsetPx = centered ? Math.max(0,(viewport.clientWidth-first.offsetWidth)/2) : 0;

      const loopCopies = stepPx > 0 ? Math.max(1, Math.ceil(viewport.clientWidth / (itemCount * stepPx))) : 1;
      setMetrics({ stepPx, maxIndex, centerOffsetPx, loopCopies, focusHeadroomPx: Math.ceil(first.offsetHeight * 0.05) });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    const first = viewport.querySelector<HTMLElement>('[data-projects-carousel-item]');
    if(first)observer.observe(first);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [viewportRef, itemCount, imageSize, gap, desktopFocus]);

  return metrics;
}

/**
 * Pointer drag on the strip. The live offset and the velocity skew never go through React state:
 * a re-render of the whole section (every slide, image and GSAP timeline) per pointermove was what
 * made the drag stutter. They are written straight onto the track as CSS variables, once per frame
 * (`--carousel-drag-x`, `--carousel-skew`), so the gesture stays on the compositor. React only learns
 * when a drag starts and ends (`dragging`) and which index to settle on.
 */
function useCarouselPointerDrag(
  viewportRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  stepPx: number,
  maxIndex: number,
  activeIndex: number,
  onIndex: (index: number) => void
): { dragging: boolean } {
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
    const track = viewport.querySelector<HTMLElement>('[data-projects-carousel-track]');
    if (!track) return undefined;

    const motion = { x: 0, lastX: 0, skew: 0, raf: 0 };
    const reduced = prefersReducedMotion();

    const frame = () => {
      motion.raf = 0;
      const dx = motion.x - motion.lastX;
      motion.lastX = motion.x;
      const targetSkew = reduced ? 0 : Math.max(-2.5, Math.min(2.5, dx * -0.12));
      motion.skew += (targetSkew - motion.skew) * 0.12;
      const settled = Math.abs(motion.skew) < 0.03 && Math.abs(targetSkew) < 0.03;
      track.style.setProperty('--carousel-drag-x', `${motion.x.toFixed(2)}px`);
      track.style.setProperty('--carousel-skew', settled ? '0deg' : `${motion.skew.toFixed(2)}deg`);
      if (!settled || dragRef.current) motion.raf = window.requestAnimationFrame(frame);
    };
    const schedule = () => {
      if (!motion.raf) motion.raf = window.requestAnimationFrame(frame);
    };

    const finish = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.startX;
      const step = stepRef.current;
      const current = indexRef.current;
      const max = maxRef.current;
      let next = current;
      if (drag.moved && step > 0) {
        const projected = dx + drag.velocity * 140;
        if (Math.abs(projected) > step * 0.2) {
          next = current + (projected < 0 ? 1 : -1);
        }
        next = Math.max(-1, Math.min(max + 1, next));
      }
      dragRef.current = null;
      // Hand the strip back to its eased transition in the same frame the offset is released, or it
      // would jump to the rest position before React re-applies the transition.
      setTrackEase(track, 'release');
      track.style.transition = CAROUSEL_TRACK_TRANSITION;
      motion.x = 0;
      motion.lastX = 0;
      track.style.setProperty('--carousel-drag-x', '0px');
      schedule();
      setDragging(false);
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
      // Capture can be refused (a synthetic event, a pointer already gone): the drag still works
      // from the viewport's own listeners, it just stops following a pointer that leaves it.
      try {
        viewport.setPointerCapture(event.pointerId);
      } catch {
        /* no active pointer with that id */
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const now = performance.now();
      const dx = event.clientX - drag.startX;
      const dt = Math.max(1, now - drag.lastT);
      // Smoothed so one jittery sample at release does not decide the whole flick.
      drag.velocity = drag.velocity * 0.6 + ((event.clientX - drag.lastX) / dt) * 0.4;
      drag.lastX = event.clientX;
      drag.lastT = now;
      if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD_PX) {
        drag.moved = true;
        suppressClickRef.current = true;
        track.style.transition = 'none';
        setDragging(true);
      }
      if (!drag.moved) return;
      event.preventDefault();
      motion.x = dx;
      schedule();
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
      if (motion.raf) window.cancelAnimationFrame(motion.raf);
      dragRef.current = null;
      track.style.setProperty('--carousel-drag-x', '0px');
      track.style.setProperty('--carousel-skew', '0deg');
      setDragging(false);
    };
  }, [viewportRef, enabled]);

  return { dragging };
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

      // Drift only: the caption and Prev/Next used to fade down to 0.58 away from center,
      // dimming the very controls the visitor needs.
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
  const t = useT();
  if (tools.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-x-0 gap-y-1.5" aria-label={t('Stack')}>
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
  const t = useT();
  const buttonClass =
    'group/nav inline-flex min-h-11 items-center gap-2 bg-transparent text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity duration-300 hover:opacity-55 focus:outline-hidden focus-visible:opacity-55 disabled:pointer-events-none disabled:opacity-25 sm:text-[12px]';

  return (
    <div
      data-carousel-nav=""
      className="flex shrink-0 items-center justify-self-end gap-7 sm:gap-9"
      data-pf-no-color-transition=""
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className={buttonClass}
        style={{ color }}
        aria-label={t('Previous project')}
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
        {t('Prev')}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className={buttonClass}
        style={{ color }}
        aria-label={t('Next project')}
        data-pf-no-color-transition=""
      >
        {t('Next')}
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

/**
 * A single thumbnail. At rest it is pure image. On hover/focus, one timeline
 * (built once, replayed with .play()/.reverse()) drives a bottom-to-top
 * gradient fading in behind the copy and each line of copy sliding up out of
 * its own mask — no motion on the image itself (the zoom-on-hover GSAP
 * tween was removed by explicit request). Leaving reverses the same
 * timeline, so a quick in/out never snaps or fights itself.
 */
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
  const t = useT();
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

  const veilRef = useRef<HTMLDivElement>(null);
  const descLineRef = useRef<HTMLParagraphElement>(null);
  const stackLineRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    // The dark veil only exists to make the description legible: no description, no darkening.
    const veil = hoverReveal && description ? veilRef.current : null;
    const descLine = hoverReveal && description ? descLineRef.current : null;
    const stackLine = hoverStack ? stackLineRef.current : null;
    const reduced = prefersReducedMotion();
    // Touch devices never reliably fire mouseenter/mouseleave, so a "hidden
    // until hover" reveal just never reveals. Skipping the whole
    // hide-then-reveal choreography on non-hover devices — same as
    // `reduced` — fixes that. `matchMedia('hover')` itself isn't fully
    // trustworthy either (hybrid devices — an iPad with a trackpad, a
    // browser's device-emulation toggle left on "mouse" — can report
    // `hover: hover` on what's actually a touch-primary device, so a real
    // tap can still synthesize a mouseenter/mouseleave pair here); that's
    // why the stack strip below no longer relies on a fixed-height
    // overflow:hidden clip to mask its hidden state — opacity-only can't
    // ever clip a partial glyph, unlike a yPercent slide inside a fixed
    // box, so even a device that's wrongly detected just gets an
    // invisible-until-tapped strip instead of visibly cropped text.
    const noHover =
      typeof window !== 'undefined' &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const skipAnim = reduced || noHover;

    if (veil) gsap.set(veil, { autoAlpha: skipAnim ? 1 : 0 });
    if (descLine) gsap.set(descLine, { yPercent: skipAnim ? 0 : 100 });
    if (stackLine) gsap.set(stackLine, { autoAlpha: skipAnim ? 1 : 0 });

    const tl = gsap.timeline({ paused: true });
    if (veil) {
      if (skipAnim) tl.set(veil, { autoAlpha: 1 }, 0);
      else tl.to(veil, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0);
    }
    if (descLine) {
      // Same fix as the veil-vs-text contrast bug found earlier this
      // session: text must not start becoming legible until the darkening
      // underneath it already has a real head start, or there's a brief
      // low-contrast window where the description is readable-ish over a
      // still-bright image. 0.22s in, the veil (power2.out, 0.4s) is
      // already ~85% dark.
      if (skipAnim) tl.set(descLine, { yPercent: 0 }, 0);
      else tl.to(descLine, { yPercent: 0, duration: 0.7, ease: 'power3.out' }, 0.22);
    }
    if (stackLine) {
      if (skipAnim) tl.set(stackLine, { autoAlpha: 1 }, 0);
      else tl.to(stackLine, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0.08);
    }
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, [hoverReveal, description, hoverStack, tools.length]);

  const onEnter = () => timelineRef.current?.play();
  const onLeave = () => timelineRef.current?.reverse();

  const media = (
    <div className={`flex flex-col ${sizeClass}`}>
      <div
        className={`relative w-full overflow-hidden ${aspectClass} ${radiusClass}`}
        style={{ backgroundColor: `${borderColor}44` }}
      >
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={title || t('Project')}
            fill
            loading="eager"
            draggable={false}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 40vw"
            className="object-cover object-center"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-6 text-center text-sm"
            style={{ color: muted }}
          >
            {t('Add a thumbnail in Information → Portfolio')}
          </div>
        )}
        {/* A small dark chip, not bare white digits: on a bright photo the old text-shadow
            left "01" at ~1.2:1. */}
        {settings.showNumbers !== false ? (
          <span
            className="pointer-events-none absolute left-3 top-3 z-[2] rounded-sm bg-black/60 px-1.5 py-1 text-[11px] font-medium leading-none tabular-nums tracking-[0.2em] text-white sm:left-4 sm:top-4"
            aria-hidden
          >
            {indexLabel}
          </span>
        ) : null}
        {hoverReveal && description ? (
          <>
            {/* Bottom-to-top gradient instead of a flat full-image tint — only
                darkens the area directly behind the description, fading to
                fully clear by ~70% up the card. The rest of the image stays
                untouched, which sidesteps the "flat tint never looks evenly
                dark across a high-contrast photo" issue entirely rather than
                fighting it with a darker alpha. Title is intentionally not
                repeated here — it's already shown in the persistent caption
                below the carousel viewport. */}
            <div
              ref={veilRef}
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0) 72%)',
              }}
              aria-hidden
              data-pf-no-color-transition=""
            />
            {description ? (
              <div
                data-pf-no-color-transition=""
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex flex-col items-start px-4 pb-4 pt-16 sm:px-5 sm:pb-5"
              >
                <div className="overflow-hidden">
                  <p
                    ref={descLineRef}
                    className="max-w-sm text-[13px] leading-relaxed text-white/85 sm:text-sm"
                    data-pf-no-color-transition=""
                  >
                    {description}
                  </p>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      {hoverStack ? (
        // Reveals via opacity only (see the timeline above) — never a
        // fixed-height clip, so there's nothing here that can crop a
        // partially-revealed line no matter how tall the tags wrap to.
        <div className="mt-3" data-pf-no-color-transition="">
          <div ref={stackLineRef} data-pf-no-color-transition="">
            <CarouselStackStrip tools={tools} ink={stackInk} rule={`${stackInk}55`} />
          </div>
        </div>
      ) : null}
    </div>
  );

  const wrapClass =
    'group block shrink-0 outline-hidden focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2';

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
          aria-label={title || t('Project')}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onFocus={onEnter}
          onBlur={onLeave}
        >
          {media}
        </a>
      );
    }
    return (
      <Link
        href={href}
        draggable={false}
        className={wrapClass}
        aria-label={title || t('Project')}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
      >
        {media}
      </Link>
    );
  }

  return (
    <div className="group shrink-0" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {media}
    </div>
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
  const t = useT();
  const settings = mergeProjectsCarouselSettings(
    DEFAULT_PROJECTS_CAROUSEL_SETTINGS,
    presentation.projectsCarousel
  );
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [resettingLoop, setResettingLoop] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const itemsKey = items.map((item) => item.id).join('|');
  const rootRef = useCarouselEntrance<HTMLDivElement>(itemsKey, 'descendants');
  const { stepPx, maxIndex, centerOffsetPx, loopCopies, focusHeadroomPx } = useCarouselSlideMetrics(
    viewportRef,
    items.length,
    settings.imageSize ?? 'lg',
    settings.gap ?? 'md',
    settings.desktopFocus ?? 'center'
  );
  const canNav = items.length > 1 && maxIndex > 0;
  const [loopReady, setLoopReady] = useState(false);
  useLayoutEffect(() => {
    const track=viewportRef.current?.querySelector<HTMLElement>('[data-projects-carousel-track]');
    if(track)void track.offsetWidth;
    const frame=requestAnimationFrame(()=>setLoopReady(canNav));
    return ()=>cancelAnimationFrame(frame);
  },[canNav]);
  const activeIndex = items.length ? ((carouselIndex % items.length) + items.length) % items.length : 0;
  // Neighbouring copies fill the strip at either end. After crossing a seam,
  // reset to the identical middle copy without animating backwards.
  useEffect(() => {
    if (!canNav || (carouselIndex >= 0 && carouselIndex < items.length)) return;
    const timer = window.setTimeout(() => {
      setResettingLoop(true);
      setCarouselIndex(((carouselIndex % items.length) + items.length) % items.length);
    },CAROUSEL_NAV_MS + 30);
    return () => window.clearTimeout(timer);
  },[carouselIndex,canNav,items.length]);
  useLayoutEffect(() => {
    if (!resettingLoop) return;
    const track=viewportRef.current?.querySelector<HTMLElement>('[data-projects-carousel-track]');
    if (track) void track.offsetWidth;
    const frame=requestAnimationFrame(()=>setResettingLoop(false));
    return ()=>cancelAnimationFrame(frame);
  },[resettingLoop]);
  const { dragging } = useCarouselPointerDrag(
    viewportRef,
    canNav,
    stepPx,
    items.length - 1,
    carouselIndex,
    (index) => {if(!resettingLoop)setCarouselIndex(index);}
  );
  useCarouselScrollKinetic(rootRef, itemsKey);

  const color = presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || color;
  // Caption + Prev/Next ink. The section title is often bound to the main color; reusing it
  // painted the project title AND the nav red. The main color now stays on the progress bar.
  const cardTitleInk = presentation.elementStyles?.cardTitle?.color?.trim();
  const ink =
    cardTitleInk ||
    (color && accent && color.trim().toLowerCase() === accent.trim().toLowerCase()
      ? 'var(--pf-palette-texte-fort, #f5f5f5)'
      : color);
  const translateX = canNav && stepPx > 0 ? (loopCopies * items.length + carouselIndex) * stepPx : 0;
  const showNumbers = settings.showNumbers !== false;
  const focusOpacity = settings.focusOpacity ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS.focusOpacity;
  // One or two slides that all fit have nothing to browse: no slide is "current", so none recedes
  // on its own. They only yield to the pointer, and the caption follows whichever one it is on.
  const canBrowse = canNav;
  const pointerIndex = dragging ? null : hoverIndex;
  const focusDim = settings.focusDim === true && items.length > 1;
  const focusedIndex = centerOffsetPx > 0 ? activeIndex : pointerIndex ?? (canBrowse ? activeIndex : null);
  const captionIndex = canBrowse ? activeIndex : (pointerIndex ?? 0);
  const progress = items.length > 0 ? ((activeIndex + 1) / items.length) * 100 : 0;

  if (items.length === 0) return null;

  const navTrack = () =>
    setTrackEase(viewportRef.current?.querySelector<HTMLElement>('[data-projects-carousel-track]'), 'nav');
  const onPrev = () => {
    navTrack();
    if(!resettingLoop)setCarouselIndex((index) => Math.max(-1, index - 1));
  };
  const onNext = () => {
    navTrack();
    if(!resettingLoop)setCarouselIndex((index) => Math.min(items.length, index + 1));
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onNext();
    } else if (event.key === 'Home') {
      event.preventDefault();
      navTrack();
      setCarouselIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      navTrack();
      setCarouselIndex(items.length - 1);
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
        style={{ touchAction: 'pan-y', paddingTop: focusDim && centerOffsetPx > 0 ? focusHeadroomPx + 4 : undefined }}
        aria-roledescription="carousel"
        aria-label={title?.trim() || t('Selected work')}
        tabIndex={canNav ? 0 : undefined}
        onKeyDown={canNav ? onKeyDown : undefined}
        data-dragging={dragging ? '1' : undefined}
      >
        {/* The scroll drift lives on its own un-transitioned layer: inside the track's transform it
            retargeted the eased snap on every scroll frame, so the strip chased the page. */}
        <div style={{ transform: centerOffsetPx > 0 ? 'none' : 'translate3d(var(--carousel-scroll-x, 0px), 0, 0)' }}>
        <div
          data-projects-carousel-track
          className={`group/carousel flex ${carouselGapClass(settings.gap ?? 'md')} transform-gpu will-change-transform`}
          style={{
            transform: `translate3d(calc(${(centerOffsetPx-translateX).toFixed(2)}px + var(--carousel-drag-x, 0px)), 0, 0) skewX(var(--carousel-skew, 0deg))`,
            transition: dragging || resettingLoop || !loopReady || !canNav ? 'none' : CAROUSEL_TRACK_TRANSITION,
          } as CSSProperties}
        >
          {(canNav ? Array.from({length:loopCopies*2+1},(_,i)=>i+1-loopCopies) : [1]).flatMap(cycle => items.map((item, index) => {
            const isActive = index === activeIndex;
            // Focus mode off: every slide is fully clear and full size, whatever the pointer or the
            // current slide. Focus mode on: the slide holding the focus (pointer, else the current
            // one) stays clear and the others fade back; nothing fades while no slide holds it.
            const dimmed = focusDim && focusedIndex !== null && index !== focusedIndex;
            const recedeClass = dimmed ? 'origin-bottom scale-[0.96]' : 'origin-bottom scale-100';
            return (
              <div
                key={`${cycle}-${item.id}`}
                aria-hidden={cycle!==1 ? true : undefined}
                inert={cycle!==1}
                data-projects-carousel-item
                data-carousel-enter={cycle===1 ? '' : undefined}
                data-enter-delay={String(Math.min(index, 5) * 70)}
                data-pf-no-color-transition=""
                className="shrink-0"
                style={cycle===1 ? SLIDE_HIDDEN : undefined}
                onPointerEnter={(event) => {
                  if (event.pointerType !== 'mouse') return;
                  setHoverIndex(index);
                }}
                onPointerLeave={() => setHoverIndex((current) => (current === index ? null : current))}
                onFocus={() => setHoverIndex(index)}
                onBlur={() => setHoverIndex((current) => (current === index ? null : current))}
                aria-current={canBrowse && isActive ? 'true' : undefined}
                aria-label={`${formatCarouselIndex(index)} ${item.title?.trim() || 'Project'}`}
              >
                {/* The focus hand-off runs on the strip's own curve: on a separate 500ms ease-out
                    clock the fade snapped in the first frames while the strip had barely moved. */}
                <div
                  className={recedeClass}
                  style={{
                    zIndex: isActive ? 2 : 1,
                    // Lift the desktop focal slide slightly, retaining its width
                    // and bottom alignment; viewport headroom prevents clipping.
                    scale: focusDim && centerOffsetPx > 0 && !dimmed ? '1 1.05' : undefined,
                    opacity: dimmed ? focusOpacity / 100 : 1,
                    transition: `scale ${CAROUSEL_FOCUS_MS}ms ${CAROUSEL_NAV_EASE}, opacity ${CAROUSEL_FOCUS_MS}ms ${CAROUSEL_NAV_EASE}`,
                  }}
                  data-pf-no-color-transition=""
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
          }))}
        </div>
        </div>
      </div>

      <div
        data-carousel-enter=""
        data-enter-delay="220"
        className="mt-6 grid grid-cols-1 items-end gap-x-8 gap-y-4 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_auto]"
        style={ENTER_HIDDEN}
      >
        {/* Overlay captions in one grid cell: the longest title/role reserves
            the natural height at every width and text size, without truncation.
            Navigation has its own row through tablet widths, never flex-wraps. */}
        <div
          data-carousel-caption=""
          className="grid w-full min-w-0"
          aria-live="polite"
        >
          {items.map((item,index) => {
            const activeTitle=item.title?.trim() || '';
            const activeRole=workRoleLabel(item);
            const visible=index===captionIndex;
            return <div key={item.id} className="min-w-0" aria-hidden={!visible}
              style={{gridArea:'1 / 1',visibility:visible?'visible':'hidden'}}>
          {showNumbers && items.length > 1 ? (
            <p
              className="text-[11px] font-medium tabular-nums tracking-[0.22em] sm:text-[12px]"
              style={{ color: muted, opacity: 0.88 }}
              data-pf-no-color-transition=""
            >
              <span key={captionIndex} className="inline-block" style={CAPTION_FADE}>
                {formatCarouselIndex(index)}
              </span>
              <span className="mx-2 opacity-40" aria-hidden>
                —
              </span>
              {formatCarouselIndex(Math.max(0, items.length - 1))}
            </p>
          ) : null}
          {activeTitle ? (
            // Keep a two-line editorial baseline; longer titles naturally grow
            // the shared grid cell for every project, not just the active one.
            <h3
              className={`${showNumbers && items.length > 1 ? 'mt-2' : ''} max-w-xl min-h-[3.5rem] text-xl font-medium tracking-[-0.035em] sm:min-h-[4.1rem] sm:text-[1.75rem] sm:leading-[1.15] lg:min-h-[4.6rem] lg:text-[2rem]`}
              style={{ color: ink }}
              data-pf-no-color-transition=""
            >
              <span key={captionIndex} className="block" style={CAPTION_FADE}>
                <EditorialTitleText text={activeTitle} />
              </span>
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
              <span key={captionIndex} className="block" style={CAPTION_FADE}>
                {activeRole}
              </span>
            </p>
          ) : null}
            </div>;
          })}
        </div>
        {canNav ? (
          <CarouselQuietNav
            color={ink}
            canPrev
            canNext
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
