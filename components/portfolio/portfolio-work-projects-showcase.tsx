'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Image from 'next/image';
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
const THUMB_GAP = 16;

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
      className="inline-flex h-11 w-11 items-center justify-center rounded-full transition duration-200 ease-out hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-current disabled:pointer-events-none disabled:opacity-40"
      style={{ color }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
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
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsShowcaseSettings;
}) {
  const mediaUrl = item.mediaUrl?.trim() || null;
  const muted = presentation.subtitleColor;
  const border = presentation.cardBorderColor || muted;
  const radiusClass = showcaseRadiusClass(settings.mediaRadius ?? 'xl');

  return (
    <figure
      className={`relative aspect-[5/6] w-full overflow-hidden ${radiusClass}`}
      style={{ backgroundColor: `${border}44` }}
    >
      {/* Crossfade only — no dark veil, keeps previous frame underneath. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={item.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          {mediaUrl ? (
            <Image
              src={mediaUrl}
              alt={item.title?.trim() || 'Project'}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
              priority={false}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center px-6 text-center text-sm"
              style={{ color: muted }}
            >
              Add a thumbnail in Information → Portfolio
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </figure>
  );
}

function ShowcaseDetails({
  item,
  presentation,
  settings,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsShowcaseSettings;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#ea580c';
  const border = presentation.cardBorderColor || muted;
  const title = item.title?.trim() || '';
  const description = item.description?.trim() || '';
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showRole = settings.showRole !== false && Boolean(role);
  const showCategory = settings.showCategory !== false && Boolean(category);
  const categoryLabel = settings.categoryLabel?.trim() || 'Category';
  const showMeta = showRole || showCategory;
  const showRule = showDescription || showMeta;

  return (
    <div className="min-w-0">
      {title ? (
        <h3
          className="max-w-xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-[3.15rem] lg:leading-[1.12]"
          style={{ color: titleColor }}
        >
          {title}
        </h3>
      ) : null}

      {showDescription ? (
        <p
          className={`max-w-lg text-base leading-relaxed sm:text-lg ${title ? 'mt-4 sm:mt-5' : ''}`}
          style={{ color: muted }}
        >
          {description}
        </p>
      ) : null}

      {showRule ? (
        <div
          className={`${title || showDescription ? 'mt-7 sm:mt-8' : ''} h-px w-full max-w-lg`}
          style={{ backgroundColor: `${border}99` }}
          aria-hidden
        />
      ) : null}

      {showMeta ? (
        <div
          className={`flex max-w-lg flex-wrap items-start justify-between gap-x-10 gap-y-5 ${showRule ? 'mt-6 sm:mt-7' : title || showDescription ? 'mt-6 sm:mt-8' : ''}`}
        >
          {showRole ? (
            <div className="min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
                style={{ color: accent }}
              >
                Role
              </p>
              <p
                className="mt-2 text-sm font-medium tracking-[-0.01em] sm:text-base"
                style={{ color: titleColor }}
              >
                {role}
              </p>
            </div>
          ) : null}
          {showCategory ? (
            <div className="min-w-0 text-right">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
                style={{ color: accent }}
              >
                {categoryLabel}
              </p>
              <p
                className="mt-2 text-sm font-medium tracking-[-0.01em] sm:text-base"
                style={{ color: titleColor }}
              >
                {category}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ProjectsShowcaseSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  trailing,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  trailing?: ReactNode;
  className?: string;
}) {
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  if (!heading && !sub && !trailing) return null;

  return (
    <header className={`mb-10 w-full sm:mb-12 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4 sm:gap-6">
        <div className="min-w-0 max-w-3xl">
          {heading ? (
            <h2
              className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl lg:leading-[1.12]"
              style={{ color: titleColor }}
            >
              {heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-2xl text-base leading-relaxed sm:text-lg ${heading ? 'mt-3' : ''}`}
              style={{ color: subtitleColor }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="pt-1 sm:pt-2">{trailing}</div> : null}
      </div>
    </header>
  );
}

/**
 * Showcase gallery — same carousel principle as Gallery design
 * “Image haute + rangée”: featured hero + sliding thumb window.
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
  const [thumbAnim, setThumbAnim] = useState<{ from: number; dir: 1 | -1 } | null>(null);
  const [thumbStep, setThumbStep] = useState(0);
  const [thumbX, setThumbX] = useState(0);
  const [thumbTween, setThumbTween] = useState(false);
  const thumbViewRef = useRef<HTMLDivElement>(null);
  const thumbTrackElRef = useRef<HTMLDivElement>(null);
  const thumbAnimRef = useRef<{ from: number; dir: 1 | -1 } | null>(null);
  const thumbTweenRef = useRef(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFrame = useRef<number | null>(null);

  const thumbVisible = Math.min(3, Math.max(0, items.length - 1));
  const hGap = THUMB_GAP;

  /** Snap track to rest without a second animated jump (kills end-of-slide palpitation). */
  const finishThumbAnim = () => {
    if (!thumbAnimRef.current) return;
    if (unlockTimer.current) {
      clearTimeout(unlockTimer.current);
      unlockTimer.current = null;
    }
    if (prevFrame.current != null) {
      cancelAnimationFrame(prevFrame.current);
      prevFrame.current = null;
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

  const measureThumbStep = (node: HTMLDivElement) => {
    if (thumbVisible <= 0) return 0;
    const itemWidth = (node.clientWidth - (thumbVisible - 1) * hGap) / thumbVisible;
    return itemWidth + hGap;
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

  const thumbBaseIndex = thumbAnim?.from ?? featuredIndex;
  const thumbs = thumbsAt(thumbBaseIndex);
  const thumbTrack =
    thumbVisible === 0
      ? []
      : thumbAnim?.dir === -1
        ? [{ item: items[thumbBaseIndex]!, index: thumbBaseIndex }, ...thumbs]
        : [...thumbs, thumbExtra(thumbBaseIndex)];

  useEffect(() => {
    if (items.length === 0) {
      setFeaturedIndex(0);
      return;
    }
    setFeaturedIndex((index) => Math.min(index, items.length - 1));
    finishThumbAnim();
  }, [items.length]);

  useEffect(() => {
    return () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
      if (prevFrame.current != null) cancelAnimationFrame(prevFrame.current);
    };
  }, []);

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
    const step = node && thumbVisible > 0 ? measureThumbStep(node) : thumbStep;
    if (step <= 0) return;

    let cancelled = false;

    if (thumbAnim.dir === 1) {
      // Extended track is mounted at x=0 — start slide on next frames.
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
      prevFrame.current = frame;
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
        prevFrame.current = null;
      };
    }

    // dir === -1: track starts at -step (no tween), then ease to 0.
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
    prevFrame.current = frame;
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      prevFrame.current = null;
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

  if (items.length === 0) return null;

  const safeIndex = Math.max(0, Math.min(featuredIndex, items.length - 1));
  const active = items[safeIndex]!;
  const ink = presentation.titleColor;
  const mediaOnLeft = (settings.mediaSide ?? 'left') === 'left';
  const border = presentation.cardBorderColor || presentation.subtitleColor;
  const radiusClass = showcaseRadiusClass(settings.mediaRadius ?? 'xl');
  const busy = Boolean(thumbAnim);

  /** Same cycle as Gallery tall-row: next promotes first thumb into the hero. */
  const cycle = (direction: -1 | 1) => {
    if (items.length < 2) return;
    if (thumbAnimRef.current) return;

    const from = safeIndex;
    const node = thumbViewRef.current;
    const step = node && thumbVisible > 0 ? measureThumbStep(node) : thumbStep;
    if (step > 0 && Math.abs(step - thumbStep) > 0.25) setThumbStep(step);

    setFeaturedIndex((current) => (current + direction + items.length) % items.length);

    if (reduceMotion || thumbVisible === 0 || step <= 0) return;

    const nextAnim = { from, dir: direction };
    thumbAnimRef.current = nextAnim;
    // Mount extended track first; useLayoutEffect starts the transform tween.
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
    <ShowcasePrimaryMedia item={active} presentation={presentation} settings={settings} />
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
                key={item.id}
                type="button"
                role="listitem"
                aria-label={`Show ${label}`}
                onClick={() => selectThumb(index)}
                disabled={busy}
                className={`relative aspect-[4/5] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-current disabled:pointer-events-none ${radiusClass}`}
                style={{
                  backgroundColor: `${border}44`,
                  boxShadow: `inset 0 0 0 1px ${border}55`,
                  flex: `0 0 ${
                    thumbStep > 0
                      ? `${Math.max(0, thumbStep - hGap)}px`
                      : `calc((100cqi - ${(thumbVisible - 1) * hGap}px) / ${Math.max(1, thumbVisible)})`
                  }`,
                }}
              >
                {mediaUrl ? (
                  <Image
                    src={mediaUrl}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 30vw, 12vw"
                    className="object-cover object-center"
                    draggable={false}
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
      {/* Top-fixed: title / description / category stay anchored while switching. */}
      <div className="shrink-0">
        <ShowcaseDetails item={active} presentation={presentation} settings={settings} />
      </div>

      <div className="mt-10 flex shrink-0 flex-col gap-5 sm:mt-12 sm:gap-6 lg:mt-auto lg:pt-10">
        <div className="flex items-center justify-end gap-1">
          <ShowcaseChevron
            direction="prev"
            onClick={() => cycle(-1)}
            label="Previous project"
            color={ink}
            disabled={busy || items.length < 2}
          />
          <ShowcaseChevron
            direction="next"
            onClick={() => cycle(1)}
            label="Next project"
            color={ink}
            disabled={busy || items.length < 2}
          />
        </div>
        {thumbStrip}
      </div>
    </div>
  );

  return (
    <section className="w-full" aria-label="Project showcase">
      <div className="flex flex-col gap-8 lg:hidden">
        {media}
        {details}
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:items-stretch lg:gap-12 xl:gap-16">
        {mediaOnLeft ? (
          <>
            <div className="min-w-0 self-start">{media}</div>
            <div className="flex min-h-0 min-w-0 flex-col self-stretch">{details}</div>
          </>
        ) : (
          <>
            <div className="flex min-h-0 min-w-0 flex-col self-stretch">{details}</div>
            <div className="min-w-0 self-start">{media}</div>
          </>
        )}
      </div>
    </section>
  );
}

export function isProjectsShowcaseDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-showcase';
}
