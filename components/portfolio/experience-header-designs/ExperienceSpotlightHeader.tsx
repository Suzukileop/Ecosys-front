'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';
import type {
  PortfolioExperiencePresentationSettings,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_EXPERIENCE_PRESENTATION,
  DEFAULT_EXPERIENCE_TITLE_COLOR,
  DEFAULT_EXPERIENCE_TITLE_COLOR_DARK,
  MARQUEE_EDGE_FADE,
  MARQUEE_FILL_OPACITY,
  MARQUEE_WEIGHT,
  SERIF_LEAD_TRACKING,
  SPOTLIGHT_MARQUEE_SPEED_PX,
  SPOTLIGHT_MARQUEE_WEIGHT,
  SPOTLIGHT_MARQUEE_GAP,
  ensureExperienceInkContrast,
  normalizeExperienceElementStyles,
  resolveExperienceColorMode,
  resolveExperienceTextColor,
  resolveMarqueeInkColor,
} from '@/components/portfolio/portfolio-experience-settings';

const MARQUEE_REPEATS = 4;

function getScrollParent(el: HTMLElement | null): HTMLElement | Window {
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
  return window;
}

function SpotlightMarqueeTrack({
  words,
  wordColor,
  strokeColor,
  dotColor,
  letterStyle,
  showSeparator,
  wordGap,
  hidden = false,
}: {
  words: string[];
  wordColor: string;
  strokeColor: string;
  dotColor: string;
  letterStyle: 'alternate' | 'fill' | 'outline' | 'mixed';
  showSeparator: boolean;
  wordGap: string;
  hidden?: boolean;
}) {
  const sequence = Array.from({ length: MARQUEE_REPEATS }, () => words).flat();

  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {sequence.map((word, index) => {
        const mixed = letterStyle === 'mixed' || letterStyle === 'alternate';
        const outline = letterStyle === 'outline' || (mixed && index % 2 === 1);
        return (
          <span
            key={`${word}-${index}`}
            className="flex shrink-0 items-center"
            style={{ gap: wordGap, paddingRight: wordGap }}
          >
            <span
              className="pf-exp-marquee-word"
              data-tone={outline ? 'outline' : 'fill'}
              style={
                outline
                  ? {
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent',
                      WebkitTextStroke: `1px ${strokeColor}`,
                    }
                  : { color: wordColor }
              }
            >
              {word}
            </span>
            {showSeparator ? (
              <span aria-hidden className="pf-exp-marquee-dot" style={{ backgroundColor: dotColor }} />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Experience → Header design for Marquee: infinite kinetic band with
 * fill / outline alternation and scroll-linked velocity.
 */
export function ExperienceSpotlightHeader({
  presentation: presentationProp,
}: {
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const presentation: PortfolioExperiencePresentationSettings = {
    ...(presentationProp ?? DEFAULT_EXPERIENCE_PRESENTATION),
    experienceDesign: 'spotlight',
  };

  const words = [
    presentation.spotlightBigTitleText?.trim() || 'Experience',
    presentation.spotlightBigTitleWord2,
    presentation.spotlightBigTitleWord3,
    presentation.spotlightBigTitleWord4,
  ]
    .map((word) => word?.trim())
    .filter((word): word is string => Boolean(word));

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const wordInk = resolveMarqueeInkColor(presentation, titleColor);
  const dotInk = resolveMarqueeInkColor(
    { ...presentation, marqueeInk: presentation.marqueeSeparatorColor ?? 'accent' },
    titleColor
  );
  const letterStyle = presentation.spotlightMarqueeStyle ?? presentation.marqueeStyle ?? 'mixed';
  const weight = presentation.spotlightMarqueeWeight ?? 'normal';
  const scale = presentation.marqueeScale ?? 'default';
  const tracking = presentation.marqueeTracking ?? 'editorial';
  const fillOpacity = presentation.marqueeFillOpacity ?? 'muted';
  const marqueeDirection = presentation.spotlightMarqueeDirection ?? 'left';
  const direction = marqueeDirection === 'right' ? 'ltr' : 'rtl';
  const speed = presentation.spotlightMarqueeSpeed ?? 'medium';
  const edgeFade = presentation.spotlightMarqueeGradientFade === false
    ? 'none'
    : (presentation.marqueeEdgeFade ?? 'soft');
  const showSeparator = (presentation.marqueeSeparator ?? 'dot') !== 'none';
  const motionEnabled =
    presentation.spotlightHeaderAnimationEnabled !== false &&
    presentation.marqueeMotion !== false;
  const scrollLink = presentation.spotlightScrollSpeedBoost === true;
  const pauseOnHover = presentation.spotlightMarqueePauseOnHover !== false;
  const wordGap = SPOTLIGHT_MARQUEE_GAP[presentation.spotlightMarqueeGap ?? 'md'];
  const pixelsPerSecond = SPOTLIGHT_MARQUEE_SPEED_PX[speed] ?? SPOTLIGHT_MARQUEE_SPEED_PX.medium;

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const root = rootRef.current;
    const row = rowRef.current;
    if (!root || !row || words.length === 0) return;
    if (reduceMotion === true || !motionEnabled) return;

    gsap.registerPlugin(ScrollTrigger);

    const proxy = { scale: 1 };
    let loop: ReturnType<typeof gsap.to> | null = null;
    let wrapWidth = 0;
    let lastY = 0;
    let settle: ReturnType<typeof gsap.to> | null = null;

    const applyScale = () => {
      loop?.timeScale(proxy.scale);
    };

    const cruiseBack = () => {
      settle?.kill();
      settle = gsap.to(proxy, {
        scale: 1,
        duration: 1.2,
        ease: 'power3.out',
        overwrite: 'auto',
        onUpdate: applyScale,
      });
    };

    const pushVelocity = (delta: number) => {
      if (!scrollLink || !loop || Math.abs(delta) < 0.4) return;
      const mag = Math.min(4.2, Math.abs(delta) / 72);
      const target = delta > 0 ? 1 + mag * 2.1 : -(1 + mag * 2.1);
      settle?.kill();
      gsap.to(proxy, {
        scale: target,
        duration: 0.16,
        ease: 'power2.out',
        overwrite: 'auto',
        onUpdate: applyScale,
        onComplete: cruiseBack,
      });
    };

    const buildLoop = () => {
      const first = row.firstElementChild as HTMLElement | null;
      wrapWidth = first?.offsetWidth ?? 0;
      if (wrapWidth < 8) return;
      loop?.kill();
      const ltr = direction !== 'rtl';
      gsap.set(row, { x: ltr ? -wrapWidth : 0 });
      loop = gsap.to(row, {
        x: ltr ? 0 : -wrapWidth,
        duration: Math.max(12, wrapWidth / pixelsPerSecond),
        ease: 'none',
        repeat: -1,
      });
      loop.timeScale(proxy.scale);
    };

    const scroller = getScrollParent(root);
    const scrollerEl = scroller === window ? undefined : (scroller as HTMLElement);

    const ctx = gsap.context(() => {
      buildLoop();
      gsap.fromTo(
        root,
        { y: 0, opacity: 1 },
        {
          y: -18,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            scroller: scrollerEl,
            start: 'top 16%',
            end: 'top -22%',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );
    }, root);

    lastY = scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;

    const onWheel = (event: WheelEvent) => {
      pushVelocity(event.deltaY);
    };
    const onScroll = () => {
      const y = scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
      pushVelocity(y - lastY);
      lastY = y;
    };

    const onEnter = () => {
      if (!pauseOnHover || !loop) return;
      settle?.kill();
      gsap.to(proxy, {
        scale: 0,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
        onUpdate: applyScale,
      });
    };
    const onLeave = () => {
      if (!pauseOnHover) return;
      cruiseBack();
    };

    const scrollerTarget: EventTarget = scroller === window ? window : scroller;
    window.addEventListener('wheel', onWheel, { passive: true });
    scrollerTarget.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('mouseenter', onEnter);
    root.addEventListener('mouseleave', onLeave);

    const resize = new ResizeObserver(() => {
      buildLoop();
      ScrollTrigger.refresh();
    });
    resize.observe(row);

    void document.fonts?.ready?.then(() => {
      buildLoop();
      ScrollTrigger.refresh();
    });

    return () => {
      window.removeEventListener('wheel', onWheel);
      scrollerTarget.removeEventListener('scroll', onScroll);
      root.removeEventListener('mouseenter', onEnter);
      root.removeEventListener('mouseleave', onLeave);
      resize.disconnect();
      settle?.kill();
      loop?.kill();
      ctx.revert();
    };
  }, [
    direction,
    motionEnabled,
    pauseOnHover,
    pixelsPerSecond,
    reduceMotion,
    scrollLink,
    words.join('|'),
  ]);

  if (presentation.spotlightBigTitleEnabled === false || words.length === 0) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="pf-exp-marquee"
      data-scale={scale}
      data-fade={edgeFade}
      style={
        {
          '--pf-exp-marquee-stroke': wordInk,
          '--pf-exp-marquee-weight': String(SPOTLIGHT_MARQUEE_WEIGHT[weight] ?? MARQUEE_WEIGHT.regular),
          '--pf-exp-marquee-tracking': SERIF_LEAD_TRACKING[tracking],
          '--pf-exp-marquee-fill': String(MARQUEE_FILL_OPACITY[fillOpacity]),
          '--pf-exp-marquee-fade': MARQUEE_EDGE_FADE[edgeFade],
        } as CSSProperties
      }
    >
      <div ref={rowRef} className="pf-exp-marquee-row">
        <SpotlightMarqueeTrack
          words={words}
          wordColor={wordInk}
          strokeColor={wordInk}
          dotColor={dotInk}
          letterStyle={letterStyle}
          showSeparator={showSeparator}
          wordGap={wordGap}
        />
        <SpotlightMarqueeTrack
          words={words}
          wordColor={wordInk}
          strokeColor={wordInk}
          dotColor={dotInk}
          letterStyle={letterStyle}
          showSeparator={showSeparator}
          wordGap={wordGap}
          hidden
        />
      </div>
    </div>
  );
}
