'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faComments, faStore } from '@fortawesome/free-solid-svg-icons';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { landingSectionShellClass } from '@/components/landing/landingBrand';

const AUTOPLAY_MS = 5000;
const EASE = [0.22, 1, 0.36, 1] as const;

const ICON_ACTIVE = 'text-black dark:text-white';
const ICON_INACTIVE = 'text-zinc-400 opacity-60 dark:text-zinc-500';

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
] as const;

type Feature = (typeof features)[number];

function DiamondBullet() {
  return (
    <span
      className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#4B5563] dark:bg-zinc-400 sm:h-3 sm:w-3"
      aria-hidden="true"
    />
  );
}

function FeatureVisual({ feature }: { feature: Feature }) {
  return (
    <div className="relative aspect-[4/3] w-full min-h-[16rem] overflow-hidden sm:min-h-[20rem] lg:aspect-auto lg:min-h-[36rem] xl:min-h-[40rem] 2xl:min-h-[44rem]">
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
      <h3 className="text-3xl font-bold tracking-tight lp-text sm:text-4xl lg:text-5xl xl:text-6xl">
        {feature.title}
      </h3>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg lg:text-xl">
        {feature.description}
      </p>
      <ul className="mt-8 space-y-4 sm:space-y-5">
        {feature.items.map((item) => (
          <li key={item} className="flex items-start gap-3.5 text-base lp-text sm:text-lg lg:text-xl">
            <DiamondBullet />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className="mt-8 inline-flex w-fit items-center gap-2.5 rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 sm:px-9 sm:py-4 sm:text-base"
      >
        <span>Get started</span>
        <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

function FeaturePanel({
  feature,
  playEntrance,
}: {
  feature: Feature;
  /** Slide-in only when this section first enters the viewport (once). */
  playEntrance: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.12fr)] lg:items-stretch lg:gap-0">
      {/* Shell keeps position after first entrance — tabs don’t re-slide */}
      <motion.div
        initial={false}
        animate={playEntrance ? { opacity: 1, x: 0 } : { opacity: 0, x: -72 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex flex-col justify-center rounded-3xl bg-neutral-50/80 px-6 py-8 dark:bg-neutral-900 sm:px-8 sm:py-10 lg:rounded-none lg:rounded-l-3xl lg:px-10 lg:py-12 xl:px-14 xl:py-16"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col"
          >
            <FeatureCopy feature={feature} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={false}
        animate={playEntrance ? { opacity: 1, x: 0 } : { opacity: 0, x: 72 }}
        transition={{ duration: 0.7, ease: EASE, delay: playEntrance ? 0.06 : 0 }}
        className="overflow-hidden rounded-3xl lg:rounded-none lg:rounded-r-3xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full w-full"
          >
            <FeatureVisual feature={feature} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

type FeaturesProps = {
  snapViewport?: boolean;
  withAnchor?: boolean;
};

export function Features({ snapViewport = false, withAnchor = true }: FeaturesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const hoverPauseRef = useRef(false);
  const desktopPanelRef = useRef<HTMLDivElement>(null);
  /** One-shot: first time the feature panels enter the viewport */
  const hasEnteredSection = useInView(desktopPanelRef, { once: true, amount: 0.2 });

  const active = features[activeIndex];

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
    setProgressKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!isDesktop || paused || hoverPauseRef.current) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
      setProgressKey((k) => k + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [isDesktop, paused, progressKey]);

  const handleSelect = (index: number) => {
    setPaused(true);
    goTo(index);
  };

  return (
    <section
      id={withAnchor ? 'features' : undefined}
      className={`lp-bg w-full transition-colors duration-300 ${
        snapViewport
          ? 'flex h-full min-h-full flex-col overflow-hidden px-4 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-24 md:px-10 lg:px-14 xl:px-20'
          : ''
      }`}
    >
      {/* Large title screen — static, no sticky / snap pin */}
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

        {/* Mobile + tablet: all feature panels stacked — each enters once */}
        <div className="flex flex-col gap-10 lg:hidden">
          {features.map((feature) => (
            <MobileFeatureEnter key={feature.id} feature={feature} />
          ))}
        </div>

        {/* Desktop: tabs + single panel — slide only on section entry */}
        <div
          className="hidden flex-col gap-6 lg:flex lg:gap-8"
          onMouseEnter={() => {
            hoverPauseRef.current = true;
            setPaused(true);
          }}
          onMouseLeave={() => {
            hoverPauseRef.current = false;
            setPaused(false);
            setProgressKey((k) => k + 1);
          }}
        >
          <div className="grid grid-cols-4 gap-5 lg:gap-8" role="tablist" aria-label="Features">
            {features.map((feat, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={feat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelect(index)}
                  onMouseEnter={() => handleSelect(index)}
                  className="justify-self-start bg-transparent text-left shadow-none outline-none"
                >
                  <span className="relative inline-flex max-w-full flex-col pb-3">
                    <span className="flex items-center gap-3 sm:gap-3.5">
                      <FontAwesomeIcon
                        icon={feat.icon}
                        className={`h-5 w-5 shrink-0 sm:h-6 sm:w-6 ${
                          isActive ? ICON_ACTIVE : ICON_INACTIVE
                        }`}
                        aria-hidden
                      />
                      <span className={`min-w-0 ${isActive ? '' : 'opacity-70'}`}>
                        <span
                          className={`block whitespace-nowrap text-sm font-extrabold leading-snug sm:text-[15px] lg:text-base ${
                            isActive ? 'lp-text' : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {feat.title}
                        </span>
                        <span
                          className={`mt-0.5 block text-xs leading-snug sm:text-sm ${
                            isActive ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        >
                          {feat.teaser}
                        </span>
                      </span>
                    </span>

                    {isActive ? (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                        {!paused ? (
                          <motion.span
                            key={progressKey}
                            className="block h-full origin-left bg-black dark:bg-white"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                          />
                        ) : (
                          <span className="block h-full w-full bg-black dark:bg-white" />
                        )}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div ref={desktopPanelRef}>
            <FeaturePanel feature={active} playEntrance={hasEnteredSection} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mobile stack item: entrance animation runs once per card when it first enters view. */
function MobileFeatureEnter({ feature }: { feature: Feature }) {
  const ref = useRef<HTMLDivElement>(null);
  const entered = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref}>
      <FeaturePanel feature={feature} playEntrance={entered} />
    </div>
  );
}
