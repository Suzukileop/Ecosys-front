'use client';

import gsap from 'gsap';
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { ProfileServiceItem } from '@/types/ecosystem';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import {
  handleServicesOrderCtaClick,
  useServicesOrderCtaNav,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';

const SWIPE_AXIS_LOCK_PX = 8;
const SWIPE_TRIGGER_PX = 46;

const ARROW_MAGNET_RADIUS = 240;
const ARROW_MAGNET_STRENGTH = 0.55;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function canHoverPrecisely(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

type HeroTokens = { bg: string; ink: string; muted: string; border: string };

function heroTokens(colorMode: 'light' | 'dark' | undefined): HeroTokens {
  const isLight = colorMode === 'light';
  const bg = isLight ? '#ffffff' : '#000000';
  return {
    bg,
    ink: isLight ? '#0a0a0a' : '#ffffff',
    muted: isLight ? 'rgba(10,10,10,0.56)' : 'rgba(255,255,255,0.56)',
    border: isLight ? 'rgba(10,10,10,0.22)' : 'rgba(255,255,255,0.26)',
  };
}

/** Renders `text` as one overflow-hidden wrapper per word so a parent effect can
 *  animate `[data-split-word]` from translateY(100%) to 0 with a stagger. */
function SplitWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-top">
            <span className="inline-block" data-split-word>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </>
  );
}

/** Native (non-passive) touch listeners so a confirmed horizontal drag can call
 *  preventDefault and stay a swipe instead of also scrolling the page underneath it. */
function useHeroSwipe(
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

/** Pulls `el` toward the cursor (via `moveX`/`moveY`) once the pointer is within `radius`,
 *  proportional to proximity; snaps the pull back to 0 once the pointer leaves that radius. */
function magnetizeToward(
  el: HTMLElement,
  moveX: (value: number) => void,
  moveY: (value: number) => void,
  clientX: number,
  clientY: number,
  radius: number,
  strength: number
) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist < radius) {
    const pull = (1 - dist / radius) * strength;
    moveX(dx * pull);
    moveY(dy * pull);
  } else {
    moveX(0);
    moveY(0);
  }
}

function ServicesHeroCtaPill({ tokens }: { tokens: HeroTokens }) {
  const { href, onNavigate } = useServicesOrderCtaNav();
  return (
    <a
      href={href}
      onClick={(event) => handleServicesOrderCtaClick(event, href, onNavigate)}
      className="group inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium"
      style={{ borderColor: tokens.border, color: tokens.ink }}
      data-pf-no-color-transition=""
    >
      Contact us
      <span
        className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
        aria-hidden
        data-pf-no-color-transition=""
      >
        →
      </span>
    </a>
  );
}

function ServicesHeroArrow({
  innerRef,
  direction,
  onClick,
  ariaLabel,
  tokens,
}: {
  innerRef: RefObject<HTMLButtonElement | null>;
  direction: 'left' | 'right';
  onClick: () => void;
  ariaLabel: string;
  tokens: HeroTokens;
}) {
  return (
    <button
      ref={innerRef}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`absolute top-1/2 z-[3] flex h-20 w-20 -translate-y-1/2 items-center justify-center opacity-60 will-change-transform hover:opacity-100 ${
        direction === 'left' ? 'left-1 md:left-3' : 'right-1 md:right-3'
      }`}
      style={{ color: tokens.ink, transition: 'opacity 0.25s ease' }}
      data-pf-no-color-transition=""
    >
      <svg viewBox="0 0 32 32" className="h-9 w-9" fill="none" aria-hidden>
        <path
          d={direction === 'left' ? 'M20 6L10 16l10 10' : 'M12 6l10 10-10 10'}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/**
 * Services "Showcase Hero" — full-bleed cinematic single-item hero: a tilted central
 * thumbnail with a title band above it and a description/CTA band below it, and two
 * magnetic edge arrows (flanking the thumbnail, not the whole stage) cycling through
 * the account's real services. Title and description are stacked in normal flow
 * around the thumbnail, not overlapping it — deliberately: an earlier version
 * overlapped the title/description on top of the thumbnail with a legibility
 * scrim/panel to keep them readable, but that still let text sit on unpredictable
 * image content. Three flex bands (title / thumbnail / description) guarantee zero
 * overlap by construction, for any image, any title length, any viewport, instead of
 * relying on masking. Mouse parallax + a split-text reveal on every change (desktop);
 * a separate stacked, swipeable tree below 768px.
 */
export function ServicesShowcaseHero({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const items = useMemo(() => services.filter((service) => service.title?.trim()), [services]);
  const count = items.length;
  const [index, setIndex] = useState(0);
  const safeIndex = count > 0 ? index % count : 0;
  const activeItem = items[safeIndex];

  const tokens = heroTokens(presentation.activeColorMode);
  const accent = presentation.ctaColor || presentation.cardAccentColor || '#f97316';
  const fallbackGradient = `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 55%, ${tokens.bg}) 100%)`;

  const stageRef = useRef<HTMLDivElement>(null);
  const mobileRootRef = useRef<HTMLDivElement>(null);
  const thumbWrapRef = useRef<HTMLDivElement>(null);
  const thumbInnerRef = useRef<HTMLDivElement>(null);
  const titleParallaxRef = useRef<HTMLDivElement>(null);
  const titleWordsRef = useRef<HTMLDivElement>(null);
  const descParallaxRef = useRef<HTMLDivElement>(null);
  const descWordsRef = useRef<HTMLDivElement>(null);
  const leftArrowRef = useRef<HTMLButtonElement>(null);
  const rightArrowRef = useRef<HTMLButtonElement>(null);

  const goTo = (nextIndex: number) => {
    if (count <= 1) return;
    const clamped = ((nextIndex % count) + count) % count;
    if (clamped === safeIndex) return;
    const thumb = thumbInnerRef.current;
    if (!thumb || prefersReducedMotion()) {
      setIndex(clamped);
      return;
    }
    gsap.killTweensOf(thumb);
    gsap.to(thumb, {
      opacity: 0,
      scale: 0.97,
      duration: 0.3,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => setIndex(clamped),
    });
  };

  useHeroSwipe(mobileRootRef, (direction) => goTo(safeIndex + direction), count <= 1);

  // Entrance + split-text reveal — plays on mount and every slide change. Deliberately not
  // gated behind a one-shot scroll trigger (nothing starts hidden waiting to be revealed),
  // matching this codebase's established fix for the "stuck hidden" reveal bug class.
  useLayoutEffect(() => {
    const thumb = thumbInnerRef.current;
    const titleWords = titleWordsRef.current?.querySelectorAll<HTMLElement>('[data-split-word]');
    const descWords = descWordsRef.current?.querySelectorAll<HTMLElement>('[data-split-word]');

    if (prefersReducedMotion()) {
      if (thumb) gsap.set(thumb, { opacity: 1, scale: 1 });
      if (titleWords?.length) gsap.set(titleWords, { yPercent: 0 });
      if (descWords?.length) gsap.set(descWords, { yPercent: 0 });
      return;
    }

    if (thumb) {
      gsap.killTweensOf(thumb);
      gsap.fromTo(
        thumb,
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', overwrite: 'auto' }
      );
    }
    if (titleWords?.length) {
      gsap.fromTo(
        titleWords,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.035, overwrite: 'auto' }
      );
    }
    if (descWords?.length) {
      gsap.fromTo(
        descWords,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.035, delay: 0.05, overwrite: 'auto' }
      );
    }
  }, [safeIndex]);

  // Mouse parallax (title/thumbnail/description at different speeds, plus a slight 3D tilt
  // on the thumbnail) + magnetic edge arrows. Desktop-only, motion-gated.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion() || !canHoverPrecisely()) return undefined;

    let detach = () => {};
    try {
      const titleWrap = titleParallaxRef.current;
      const thumbWrap = thumbWrapRef.current;
      const descWrap = descParallaxRef.current;
      const leftArrow = leftArrowRef.current;
      const rightArrow = rightArrowRef.current;

      if (thumbWrap) gsap.set(thumbWrap, { transformPerspective: 900 });

      const titleX = titleWrap ? gsap.quickTo(titleWrap, 'x', { duration: 0.9, ease: 'power3' }) : null;
      const titleY = titleWrap ? gsap.quickTo(titleWrap, 'y', { duration: 0.9, ease: 'power3' }) : null;
      const thumbX = thumbWrap ? gsap.quickTo(thumbWrap, 'x', { duration: 0.9, ease: 'power3' }) : null;
      const thumbY = thumbWrap ? gsap.quickTo(thumbWrap, 'y', { duration: 0.9, ease: 'power3' }) : null;
      const thumbRotX = thumbWrap ? gsap.quickTo(thumbWrap, 'rotationX', { duration: 0.9, ease: 'power3' }) : null;
      const thumbRotY = thumbWrap ? gsap.quickTo(thumbWrap, 'rotationY', { duration: 0.9, ease: 'power3' }) : null;
      const descX = descWrap ? gsap.quickTo(descWrap, 'x', { duration: 0.9, ease: 'power3' }) : null;
      const descY = descWrap ? gsap.quickTo(descWrap, 'y', { duration: 0.9, ease: 'power3' }) : null;
      const leftX = leftArrow ? gsap.quickTo(leftArrow, 'x', { duration: 0.9, ease: 'power3' }) : null;
      const leftY = leftArrow ? gsap.quickTo(leftArrow, 'y', { duration: 0.9, ease: 'power3' }) : null;
      const rightX = rightArrow ? gsap.quickTo(rightArrow, 'x', { duration: 0.9, ease: 'power3' }) : null;
      const rightY = rightArrow ? gsap.quickTo(rightArrow, 'y', { duration: 0.9, ease: 'power3' }) : null;

      const onMove = (event: PointerEvent) => {
        const rect = stage.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;

        titleX?.(px * 30);
        titleY?.(py * 18);
        thumbX?.(px * 16);
        thumbY?.(py * 10);
        thumbRotX?.(py * -5);
        thumbRotY?.(px * 6);
        descX?.(px * 9);
        descY?.(py * 6);

        if (leftArrow && leftX && leftY) {
          magnetizeToward(leftArrow, leftX, leftY, event.clientX, event.clientY, ARROW_MAGNET_RADIUS, ARROW_MAGNET_STRENGTH);
        }
        if (rightArrow && rightX && rightY) {
          magnetizeToward(rightArrow, rightX, rightY, event.clientX, event.clientY, ARROW_MAGNET_RADIUS, ARROW_MAGNET_STRENGTH);
        }
      };

      const onLeave = () => {
        titleX?.(0);
        titleY?.(0);
        thumbX?.(0);
        thumbY?.(0);
        thumbRotX?.(0);
        thumbRotY?.(0);
        descX?.(0);
        descY?.(0);
        leftX?.(0);
        leftY?.(0);
        rightX?.(0);
        rightY?.(0);
      };

      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerleave', onLeave);
      detach = () => {
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerleave', onLeave);
      };
    } catch (error) {
      console.error('[ServicesShowcaseHero] GSAP parallax/magnetic setup failed', error);
    }

    return () => detach();
  }, []);

  if (count === 0 || !activeItem) return null;

  const counter =
    count > 1 ? `${String(safeIndex + 1).padStart(2, '0')} — ${String(count).padStart(2, '0')}` : '';

  return (
    <>
      {/* Desktop / tablet — full-bleed cinematic stage, three stacked bands (title /
          thumbnail / description) so text can never land on top of the image. */}
      <div
        ref={stageRef}
        className="relative left-1/2 hidden min-h-[80vh] w-screen -translate-x-1/2 select-none overflow-hidden md:flex md:flex-col"
        data-pf-no-color-transition=""
      >
        {/* Title band. */}
        <div className="flex items-start justify-between gap-6 px-[6%] pt-16 lg:pt-20">
          <div ref={titleParallaxRef} className="max-w-[46%] will-change-transform">
            <div
              ref={titleWordsRef}
              className="font-sans text-[clamp(2.25rem,4.5vw,5rem)] font-black leading-[0.95] tracking-[-0.02em]"
              style={{ color: tokens.ink }}
            >
              <SplitWords text={activeItem.title} />
            </div>
          </div>
          {counter ? (
            <p className="shrink-0 pt-1 text-xs font-semibold tabular-nums" style={{ color: tokens.muted }}>
              {counter}
            </p>
          ) : null}
        </div>

        {/* Thumbnail band — the only full-bleed-width element; generous clearance from the
            title/description bands above and below means its tilt never reaches into them. */}
        <div
          ref={thumbWrapRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden px-[8%] py-10 will-change-transform lg:py-14"
        >
          <div className="relative aspect-[4/3] w-[46%] max-w-[760px]">
            <div
              ref={thumbInnerRef}
              className="absolute inset-0 origin-center will-change-transform"
              style={{ transform: 'rotate(-2.5deg)' }}
              data-pf-no-color-transition=""
            >
              {activeItem.coverImageUrl ? (
                <PortfolioDeferredMedia
                  src={activeItem.coverImageUrl}
                  alt={activeItem.title}
                  className="h-full w-full"
                  objectFit="cover"
                  eager
                />
              ) : (
                <div className="h-full w-full" style={{ background: fallbackGradient }} aria-hidden />
              )}
            </div>
          </div>

          {count > 1 ? (
            <>
              <ServicesHeroArrow
                innerRef={leftArrowRef}
                direction="left"
                onClick={() => goTo(safeIndex - 1)}
                ariaLabel="Previous service"
                tokens={tokens}
              />
              <ServicesHeroArrow
                innerRef={rightArrowRef}
                direction="right"
                onClick={() => goTo(safeIndex + 1)}
                ariaLabel="Next service"
                tokens={tokens}
              />
            </>
          ) : null}
        </div>

        {/* Description + CTA band. */}
        <div className="flex items-end justify-between gap-6 px-[6%] pb-16 lg:pb-20">
          <ServicesHeroCtaPill tokens={tokens} />
          {activeItem.description?.trim() ? (
            <div ref={descParallaxRef} className="max-w-[22rem] text-right will-change-transform">
              <div
                ref={descWordsRef}
                className="text-[0.92rem] font-normal leading-[1.6]"
                style={{ color: tokens.muted }}
              >
                <SplitWords text={activeItem.description} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile — single stacked, swipeable flow. No mouse-tracking, no arrows. */}
      <div
        ref={mobileRootRef}
        className="relative left-1/2 block w-screen -translate-x-1/2 md:hidden"
        data-pf-no-color-transition=""
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {activeItem.coverImageUrl ? (
            <PortfolioDeferredMedia
              src={activeItem.coverImageUrl}
              alt={activeItem.title}
              className="h-full w-full"
              objectFit="cover"
              eager
            />
          ) : (
            <div className="h-full w-full" style={{ background: fallbackGradient }} aria-hidden />
          )}
        </div>
        <div className="px-6 pb-10 pt-7 text-center">
          <h3
            className="font-sans font-black leading-[0.98] tracking-[-0.01em]"
            style={{ color: tokens.ink, fontSize: 'clamp(1.9rem, 8vw, 2.75rem)' }}
          >
            {activeItem.title}
          </h3>
          {activeItem.description?.trim() ? (
            <p className="mx-auto mt-4 max-w-sm text-sm leading-[1.6]" style={{ color: tokens.muted }}>
              {activeItem.description}
            </p>
          ) : null}
          <div className="mt-7 flex justify-center">
            <ServicesHeroCtaPill tokens={tokens} />
          </div>
          {counter ? (
            <p className="mt-5 text-xs font-semibold tabular-nums" style={{ color: tokens.muted }}>
              {counter}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function isServicesShowcaseHeroDesign(presentation: PortfolioServicesPresentationSettings): boolean {
  return presentation.sectionDesign === 'showcase-hero';
}
