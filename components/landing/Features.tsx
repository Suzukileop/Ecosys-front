'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faCheck, faComments, faStore, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import {
  brandCtaClass,
  brandFrameRadiusClass,
  landingCheckBulletClass,
  landingCheckIconClass,
  landingPanelSurfaceClass,
  landingSectionShellClass,
} from '@/components/landing/landingBrand';

const EASE = [0.22, 1, 0.36, 1] as const;
/** Scroll distance per step while the sticky block is pinned (vh). */
const STORY_STEP_VH = 52;

const features = [
  {
    id: 'portfolio',
    icon: faBriefcase,
    title: 'Portfolio builder',
    teaser: 'Launch a custom page in minutes',
    description:
      'Turn your information, experience, and work into a professional online presence that reflects who you are.',
    items: [
      'No code — just put all the necessary information',
      'Ready-to-use responsive templates',
      'Custom colors and branding',
      'Showcase projects and experience',
      'Publish and share in a few clicks',
    ],
    image: '/landing/hero/image1.png',
    imageAlt: 'Student portfolio showcase',
  },
  {
    id: 'shop',
    icon: faStore,
    title: 'Services and online shop',
    teaser: 'Sell products and services simply',
    description:
      'Present what you offer, display your products, and give customers one simple place to discover and buy from you.',
    items: [
      'No code — just put all the necessary information',
      'Service and product catalog',
      'Clear pricing and descriptions',
      'Simple online storefront',
      'Direct customer requests and sales',
    ],
    image: '/landing/hero/image3.png',
    imageAlt: 'Online shop product view',
  },
  {
    id: 'business',
    icon: faBuilding,
    title: 'Business presence',
    teaser: 'A clear brand for your company',
    description:
      'Give your company a clear online identity. Showcase your brand, team, and offers in one professional space.',
    items: [
      'No code — just put all the necessary information',
      'Professional company page',
      'Team and brand showcase',
      'Services and offers in one place',
      'Easy sharing with clients',
    ],
    image: '/landing/hero/image2.png',
    imageAlt: 'Business team presenting their brand',
  },
  {
    id: 'chat',
    icon: faComments,
    title: 'Direct client communication',
    teaser: 'Chat without any middleman',
    description:
      'Connect with customers inside NoProbleme and manage every conversation without relying on another application.',
    items: [
      'No code — just put all the necessary information',
      'Built-in private messaging',
      'Centralized client conversations',
      'Faster questions and responses',
      'No platform middleman',
    ],
    image: '/landing/hero/image0.png',
    imageAlt: 'Creator chatting with clients',
  },
  {
    id: 'freelancer',
    icon: faUserTie,
    title: 'Service Provider',
    teaser: 'Freelance work in one profile',
    description:
      'Show your expertise, get discovered by clients, and run your freelance work from one professional profile.',
    items: [
      'No code — just put all the necessary information',
      'Professional service provider profile',
      'Showcase expertise and past work',
      'Get discovered by new clients',
      'Manage offers and conversations in one place',
    ],
    image: '/landing/hero/portrait-pro-freelan.png',
    imageAlt: 'Freelancers collaborating in a professional workspace',
  },
] as const;

type Feature = (typeof features)[number];

const TAB_BORDER = 'border-neutral-200 dark:border-neutral-700';

function useScrollStoryStep(
  trackRef: RefObject<HTMLDivElement | null>,
  stepCount: number,
  enabled: boolean,
) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const track = trackRef.current;
    if (!track) return;

    let raf = 0;

    const update = () => {
      const el = trackRef.current;
      if (!el) return;

      const viewport = window.innerHeight;
      const scrollable = Math.max(el.offsetHeight - viewport, 1);
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), scrollable);
      const progress = scrolled / scrollable;
      const stepPos = progress * stepCount;
      const rawIndex = Math.min(stepCount - 1, Math.max(0, Math.floor(stepPos)));

      setActiveIndex((prev) => {
        if (rawIndex === prev) return prev;
        const pad = 0.06;
        if (rawIndex > prev && stepPos < prev + 1 + pad) return prev;
        if (rawIndex < prev && stepPos > prev - pad) return prev;
        return rawIndex;
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [trackRef, stepCount, enabled]);

  return activeIndex;
}

function scrollToStoryStep(
  trackRef: RefObject<HTMLDivElement | null>,
  index: number,
  stepCount: number,
  behavior: ScrollBehavior,
) {
  const track = trackRef.current;
  if (!track || stepCount <= 1) return;

  const viewport = window.innerHeight;
  const scrollable = Math.max(track.offsetHeight - viewport, 0);
  const progress = (index + 0.5) / stepCount;
  const top = track.offsetTop + progress * scrollable;

  window.scrollTo({ top, behavior });
}

function FeatureGridTab({
  feature,
  isActive,
  cellClass,
  size = 'compact',
  onLearnMore,
}: {
  feature: Feature;
  isActive: boolean;
  cellClass: string;
  size?: 'compact' | 'hero';
  onLearnMore?: () => void;
}) {
  const hero = size === 'hero';

  return (
    <article
      className={`group relative flex flex-col items-center text-center transition-colors duration-300 ${
        hero
          ? `justify-between gap-5 px-6 py-8 sm:gap-6 sm:px-8 sm:py-10 xl:gap-7 xl:px-10 xl:py-11 ${brandFrameRadiusClass} hover:bg-neutral-200/90 dark:hover:bg-neutral-800`
          : 'min-h-[8.5rem] justify-center gap-3 px-4 py-5 sm:min-h-[9.5rem] sm:gap-3.5 sm:px-6 sm:py-6 bg-transparent'
      } ${cellClass} ${landingPanelSurfaceClass}`}
    >
      <div className={`flex flex-col items-center ${hero ? 'gap-4 sm:gap-5 xl:gap-6' : 'gap-3'}`}>
        <span
          className={`flex shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            hero ? 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] xl:h-20 xl:w-20' : 'h-11 w-11 sm:h-12 sm:w-12'
          } ${
            isActive
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
              : 'bg-neutral-200 text-zinc-700 dark:bg-neutral-800 dark:text-zinc-300'
          } ${
            hero
              ? 'group-hover:bg-neutral-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-950'
              : ''
          }`}
        >
          <FontAwesomeIcon
            icon={feature.icon}
            className={hero ? 'h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9' : 'h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]'}
            aria-hidden
          />
        </span>

        <span className={`flex flex-col ${hero ? 'max-w-[22rem] gap-2 sm:max-w-[26rem] xl:max-w-[30rem] xl:gap-2.5' : 'max-w-[14rem] gap-1'}`}>
          <span
            className={`font-extrabold leading-snug transition-colors duration-300 lp-text ${
              hero
                ? 'text-lg sm:text-xl xl:text-2xl 2xl:text-[1.75rem]'
                : 'text-sm sm:text-[15px] lg:text-base'
            }`}
          >
            {feature.title}
          </span>
          <span
            className={`leading-snug transition-colors duration-300 text-zinc-600 dark:text-zinc-400 ${
              hero ? 'text-sm sm:text-base xl:text-lg' : 'text-xs sm:text-sm'
            }`}
          >
            {feature.teaser}
          </span>
        </span>
      </div>

      {hero ? (
        <a
          href="#feature-story"
          onClick={(event) => {
            if (!onLearnMore) return;
            event.preventDefault();
            onLearnMore();
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F97316] underline-offset-4 transition-colors duration-300 hover:text-[#EA580C] hover:underline sm:text-base xl:text-lg"
        >
          Learn more
          <span aria-hidden="true">→</span>
        </a>
      ) : null}

      {isActive && !hero ? (
        <span
          className="absolute inset-x-0 bottom-0 h-[2px] bg-black dark:bg-white"
          aria-hidden="true"
        />
      ) : null}
    </article>
  );
}

function FeatureCheckBullet() {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full sm:mt-1 sm:h-6 sm:w-6 ${landingCheckBulletClass}`}
      aria-hidden="true"
    >
      <FontAwesomeIcon icon={faCheck} className={landingCheckIconClass} />
    </span>
  );
}

function FeatureVisual({ feature }: { feature: Feature }) {
  return (
    <div className="relative aspect-[4/3] w-full min-h-[16rem] overflow-hidden sm:min-h-[18rem] lg:aspect-auto lg:min-h-[26rem] xl:min-h-[28rem] 2xl:min-h-[30rem]">
      <Image
        src={feature.image}
        alt={feature.imageAlt}
        fill
        className="object-cover"
        sizes="(max-width: 1023px) 100vw, 58vw"
      />
    </div>
  );
}

function FeatureCopy({ feature }: { feature: Feature }) {
  return (
    <>
      <h3 className="text-3xl font-bold tracking-tight lp-text sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
        {feature.title}
      </h3>
      <p className="mt-7 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:mt-8 sm:text-lg lg:text-xl">
        {feature.description}
      </p>
      <ul className="mt-9 space-y-6 sm:mt-10 sm:space-y-7">
        {feature.items.map((item) => (
          <li key={item} className="flex items-start gap-3.5 text-base lp-text sm:text-lg lg:text-xl">
            <FeatureCheckBullet />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`mt-9 inline-flex w-fit items-center gap-2.5 px-8 py-3 text-sm font-semibold uppercase tracking-wider sm:mt-10 sm:px-9 sm:py-3.5 sm:text-base ${brandCtaClass}`}
      >
        <span>Get started</span>
        <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

function DesktopFeatureGrid({
  activeIndex,
  size = 'compact',
  className = '',
  onLearnMore,
}: {
  activeIndex: number;
  size?: 'compact' | 'hero';
  className?: string;
  onLearnMore?: (index: number) => void;
}) {
  const hero = size === 'hero';
  const tabs: Array<{ index: number; cellClass: string }> = hero
    ? [
        { index: 0, cellClass: '' },
        { index: 1, cellClass: '' },
        { index: 2, cellClass: '' },
        { index: 3, cellClass: '' },
        { index: 4, cellClass: '' },
      ]
    : [
        { index: 0, cellClass: 'col-start-1 row-start-1' },
        { index: 1, cellClass: 'col-start-2 row-start-1' },
        { index: 2, cellClass: 'col-start-1 row-start-2' },
        { index: 3, cellClass: 'col-start-2 row-start-2' },
        { index: 4, cellClass: 'col-start-3 row-start-1 row-span-2' },
      ];

  return (
    <div
      className={`grid ${
        hero
          ? 'grid-cols-3 gap-4 sm:gap-5 xl:gap-6'
          : `grid-cols-3 grid-rows-2 overflow-hidden border ${TAB_BORDER} ${brandFrameRadiusClass}`
      } ${className}`}
      aria-label="Features overview"
    >
      {tabs.map(({ index, cellClass }) => {
        const feat = features[index];
        const joinedBorders = hero
          ? ''
          : index === 0
            ? `border-r border-b ${TAB_BORDER}`
            : index === 1
              ? `border-b ${TAB_BORDER}`
              : index === 2
                ? `border-r ${TAB_BORDER}`
                : index === 4
                  ? `border-l ${TAB_BORDER}`
                  : '';
        return (
          <FeatureGridTab
            key={feat.id}
            feature={feat}
            isActive={index === activeIndex}
            size={size}
            cellClass={`${cellClass} ${joinedBorders}`.trim()}
            onLearnMore={onLearnMore ? () => onLearnMore(index) : undefined}
          />
        );
      })}
      {hero ? <FeatureGridCtaCard /> : null}
    </div>
  );
}

function FeatureGridCtaCard() {
  return (
    <article
      className={`group relative flex flex-col items-center justify-center gap-5 px-6 py-8 text-center sm:gap-6 sm:px-8 sm:py-10 xl:gap-7 xl:px-10 xl:py-11 ${brandFrameRadiusClass} hover:bg-neutral-200/90 dark:hover:bg-neutral-800 ${landingPanelSurfaceClass}`}
    >
      <p className="max-w-[16rem] text-lg font-extrabold leading-snug lp-text sm:max-w-[18rem] sm:text-xl xl:max-w-[20rem] xl:text-2xl 2xl:text-[1.75rem]">
        Ready to get started?
      </p>
      <Link
        href="/register"
        className={`inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold sm:px-10 sm:py-4 sm:text-base ${brandCtaClass}`}
      >
        Try for free
      </Link>
    </article>
  );
}

function FeatureGridFullPage({
  onLearnMore,
}: {
  onLearnMore?: (index: number) => void;
}) {
  return (
    <div className="relative w-full">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: EASE }}
        className={`w-full ${landingSectionShellClass} py-16 sm:py-20 lg:py-24`}
      >
        <DesktopFeatureGrid activeIndex={-1} size="hero" onLearnMore={onLearnMore} />
      </motion.div>
    </div>
  );
}

const SLIDE_VARIANTS = {
  enter: (direction: 1 | -1) => ({ x: direction > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (direction: 1 | -1) => ({ x: direction > 0 ? '-100%' : '100%' }),
} as const;

function FeatureStoryDots({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center sm:bottom-5"
      role="tablist"
      aria-label="Feature displays"
    >
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-neutral-950/55 px-3 py-2 backdrop-blur-sm dark:bg-white/20">
        {features.map((feature, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={feature.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Show ${feature.title}`}
              onClick={() => onSelect(index)}
              className={`rounded-full transition-[width,height,background-color] duration-300 ${
                isActive
                  ? 'h-2.5 w-2.5 bg-white'
                  : 'h-2 w-2 bg-white/45 hover:bg-white/75'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function FeatureStoryPanel({
  feature,
  direction,
  skipEnter,
  reducedMotion,
}: {
  feature: Feature;
  direction: 1 | -1;
  skipEnter: boolean;
  reducedMotion: boolean;
}) {
  const slideTransition = reducedMotion
    ? { duration: 0 }
    : { type: 'tween' as const, duration: 0.38, ease: EASE };

  return (
    <div
      className={`relative h-full min-h-0 w-full overflow-hidden ${brandFrameRadiusClass}`}
      role="region"
      aria-roledescription="carousel"
      aria-live="polite"
      aria-label={`${feature.title} details`}
    >
      <AnimatePresence mode="sync" custom={direction} initial={false}>
        <motion.div
          key={feature.id}
          custom={direction}
          variants={SLIDE_VARIANTS}
          initial={skipEnter || reducedMotion ? false : 'enter'}
          animate="center"
          exit="exit"
          transition={slideTransition}
          className="absolute inset-0 grid h-full w-full grid-cols-[minmax(0,0.92fr)_minmax(0,1.12fr)] items-stretch gap-0"
        >
          <div
            className={`flex min-h-0 flex-col justify-center overflow-hidden px-6 pb-14 pt-5 sm:px-8 sm:pb-16 sm:pt-6 lg:px-9 lg:pb-16 lg:pt-6 xl:px-10 xl:pt-7 ${landingPanelSurfaceClass}`}
          >
            <FeatureCopy feature={feature} />
          </div>

          <div className="relative h-full min-h-0 overflow-hidden">
            <Image
              src={feature.image}
              alt={feature.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1023px) 100vw, 58vw"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ScrollDrivenFeatureStory({
  trackRef,
  reducedMotion,
}: {
  trackRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
}) {
  const activeIndex = useScrollStoryStep(trackRef, features.length, !reducedMotion);
  const previousIndexRef = useRef(activeIndex);
  const directionRef = useRef<1 | -1>(1);
  const skipFirstEnterRef = useRef(true);
  const active = features[activeIndex];

  if (previousIndexRef.current !== activeIndex) {
    directionRef.current = activeIndex > previousIndexRef.current ? 1 : -1;
    previousIndexRef.current = activeIndex;
    skipFirstEnterRef.current = false;
  }
  const direction = directionRef.current;

  if (reducedMotion) {
    return (
      <div className="flex flex-col gap-10">
        {features.map((feature) => (
          <FeaturePanel key={feature.id} feature={feature} playEntrance reducedMotion />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      id="feature-story"
      className="relative"
      style={{ height: `${features.length * STORY_STEP_VH}vh` }}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div className="relative h-[min(78svh,46rem)] w-full">
          <FeatureStoryPanel
            feature={active}
            direction={direction}
            skipEnter={skipFirstEnterRef.current}
            reducedMotion={false}
          />
          <FeatureStoryDots
            activeIndex={activeIndex}
            onSelect={(index) => scrollToStoryStep(trackRef, index, features.length, 'smooth')}
          />
        </div>
      </div>
    </div>
  );
}

function FeaturePanel({
  feature,
  playEntrance,
  reducedMotion = false,
}: {
  feature: Feature;
  playEntrance: boolean;
  reducedMotion?: boolean;
}) {
  return (
    <div
      id={`feature-story-${feature.id}`}
      className="grid grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.12fr)] lg:items-stretch lg:gap-0"
    >
      <motion.div
        initial={false}
        animate={
          reducedMotion || playEntrance ? { opacity: 1, x: 0 } : { opacity: 0, x: -72 }
        }
        transition={{ duration: reducedMotion ? 0 : 0.7, ease: EASE }}
        className={`flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:rounded-none lg:rounded-l-lg lg:px-10 lg:py-12 xl:px-14 xl:py-16 ${landingPanelSurfaceClass} ${brandFrameRadiusClass}`}
      >
        <FeatureCopy feature={feature} />
      </motion.div>

      <motion.div
        initial={false}
        animate={
          reducedMotion || playEntrance ? { opacity: 1, x: 0 } : { opacity: 0, x: 72 }
        }
        transition={{
          duration: reducedMotion ? 0 : 0.7,
          ease: EASE,
          delay: reducedMotion || !playEntrance ? 0 : 0.06,
        }}
        className={`overflow-hidden lg:rounded-none lg:rounded-r-lg ${brandFrameRadiusClass}`}
      >
        <FeatureVisual feature={feature} />
      </motion.div>
    </div>
  );
}

type FeaturesProps = {
  snapViewport?: boolean;
  withAnchor?: boolean;
};

export function Features({ snapViewport = false, withAnchor = true }: FeaturesProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const storyTrackRef = useRef<HTMLDivElement>(null);

  const handleLearnMore = useCallback(
    (index: number) => {
      if (reducedMotion) {
        document
          .getElementById(`feature-story-${features[index].id}`)
          ?.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }

      scrollToStoryStep(storyTrackRef, index, features.length, 'smooth');
    },
    [reducedMotion],
  );

  return (
    <section
      id={withAnchor ? 'features' : undefined}
      className={`lp-bg w-full transition-colors duration-300 ${
        snapViewport
          ? 'flex h-full min-h-full flex-col overflow-hidden px-4 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-24 md:px-10 lg:px-14 xl:px-20'
          : ''
      }`}
    >
      {!snapViewport ? (
        <div className="relative flex min-h-[100svh] w-full items-center justify-center px-5 sm:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="max-w-[20ch] text-center text-[clamp(2.5rem,7.5vw,6.75rem)] font-bold leading-[0.98] tracking-tight lp-text sm:max-w-[22ch]"
          >
            Build your online presence
          </motion.h2>
        </div>
      ) : null}

      {!snapViewport ? (
        <div className="hidden lg:block">
          <FeatureGridFullPage onLearnMore={handleLearnMore} />
        </div>
      ) : null}

      <div
        className={`flex w-full flex-col bg-transparent ${landingSectionShellClass} ${
          snapViewport
            ? 'min-h-0 flex-1 justify-center overflow-hidden py-6 sm:py-8'
            : 'pb-16 pt-4 lg:pb-24 xl:pb-32'
        }`}
      >
        {snapViewport ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-center sm:mb-8"
          >
            <h2 className="text-[1.7rem] font-bold leading-tight tracking-tight lp-text sm:text-4xl lg:text-[2.85rem]">
              Build your online presence
            </h2>
          </motion.div>
        ) : null}

        <div className="flex flex-col gap-10 lg:hidden">
          {features.map((feature) => (
            <MobileFeatureEnter key={feature.id} feature={feature} />
          ))}
        </div>

        <div className="hidden lg:block">
          {snapViewport ? (
            <div className="flex flex-col gap-8">
              <DesktopFeatureGrid activeIndex={-1} size="hero" />
              <FeaturePanel feature={features[0]} playEntrance reducedMotion={reducedMotion} />
            </div>
          ) : (
            <ScrollDrivenFeatureStory trackRef={storyTrackRef} reducedMotion={reducedMotion} />
          )}
        </div>
      </div>
    </section>
  );
}

function MobileFeatureEnter({ feature }: { feature: Feature }) {
  const ref = useRef<HTMLDivElement>(null);
  const entered = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref}>
      <FeaturePanel feature={feature} playEntrance={entered} />
    </div>
  );
}
