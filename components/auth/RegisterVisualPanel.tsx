'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const HERO_IMAGE_WIDTH = 5056;
const HERO_IMAGE_HEIGHT = 3392;
const GALLERY_ROTATE_MS = 4000;
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const GALLERY_FADE = {
  duration: 0.65,
  ease: REVEAL_EASE,
} as const;

const galleryItems = [
  {
    src: '/landing/hero/image0.png',
    alt: 'Creator building a portfolio at their desk',
    title: 'Portfolio & services',
    description:
      'Turn your skills into a professional page. Present your work, list your services, and let clients reach you directly.',
  },
  {
    src: '/landing/hero/image1.png',
    alt: 'Graduate showcasing achievements',
    title: 'Student portfolio',
    description:
      'Highlight your projects, experience, and achievements in a clean portfolio ready to share with schools and employers.',
  },
  {
    src: '/landing/hero/image2.png',
    alt: 'Business team presenting their brand',
    title: 'Business presence',
    description:
      'Give your company a clear online identity. Showcase your brand, team, and offers in one professional space.',
  },
  {
    src: '/landing/hero/image3.png',
    alt: 'Seller managing an online shop',
    title: 'Online shop',
    description:
      'Launch a simple storefront, display your products, and talk to buyers without leaving the platform.',
  },
] as const;

export function RegisterVisualPanel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const active = galleryItems[selectedIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % galleryItems.length);
    }, GALLERY_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [selectedIndex]);

  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-2xl bg-[#F8F9FC] px-6 py-8 dark:bg-neutral-950 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <div className="pointer-events-none absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-[#F97316]/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-12 bottom-1/4 h-48 w-48 rounded-full bg-[#FB923C]/10 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[40rem] flex-col justify-center xl:max-w-[44rem]">
        <div className="flex h-[min(40rem,82vh)] flex-col gap-5 lg:h-[min(44rem,86vh)] lg:gap-6">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={active.src}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={GALLERY_FADE}
                className="absolute inset-0"
              >
                <Image
                  src={active.src}
                  alt={active.alt}
                  width={HERO_IMAGE_WIDTH}
                  height={HERO_IMAGE_HEIGHT}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 1024px) 90vw, 640px"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative h-[7.5rem] shrink-0 overflow-hidden sm:h-[8.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: REVEAL_EASE }}
                className="absolute inset-0"
              >
                <h3 className="mb-2 text-2xl font-bold leading-snug text-neutral-900 dark:text-white sm:text-3xl">
                  {active.title}
                </h3>
                <p className="max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base lg:text-lg">
                  {active.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
