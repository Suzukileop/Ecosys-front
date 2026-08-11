'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { brandSolidBg } from '@/components/landing/landingBrand';

/** Paramètres Unsplash — format vertical TikTok 9:16 (405×720). */
const TIKTOK_IMG = 'w=405&h=720&fit=crop&q=75&auto=format';

const unsplash = (id: string) => `https://images.unsplash.com/${id}?${TIKTOK_IMG}`;

/** 10 visuels suffisent pour la boucle marquee (évite 40 requêtes réseau au chargement). */
const POPULAR_NICHES = [
  { title: 'Fitness & bien-être', image: unsplash('photo-1571019614242-c5c5dee9f50b') },
  { title: 'Cuisine & food', image: unsplash('photo-1567620905732-2d1ec7ab7445') },
  { title: 'Mode & lifestyle', image: unsplash('photo-1469334031218-e382a71b716b') },
  { title: 'Tech & innovation', image: unsplash('photo-1516321318423-f06f85e504b3') },
  { title: 'Voyage & aventure', image: unsplash('photo-1501785888041-af3ef285b470') },
  { title: 'Finance personnelle', image: unsplash('photo-1611162617474-5b21e879e113') },
  { title: 'Beauté & skincare', image: unsplash('photo-1522335789203-aabd1fc54bc9') },
  { title: 'Gaming & esport', image: unsplash('photo-1542751371-adc38448a05e') },
  { title: 'Parentalité', image: unsplash('photo-1511895426328-dc8714191300') },
  { title: 'Immobilier', image: unsplash('photo-1560518883-ce09059eeffa') },
  { title: 'Crypto & Web3', image: unsplash('photo-1559526324-593bc073d938') },
  { title: 'Coaching business', image: unsplash('photo-1517245386807-bb43f82c33c4') },
  { title: 'Yoga & mindfulness', image: unsplash('photo-1571902943202-507ec2618e8f') },
  { title: 'E-commerce', image: unsplash('photo-1441986300917-64674bd600d8') },
  { title: 'Musique & création', image: unsplash('photo-1511671782779-c97d3d27a1d4') },
] as const;

function NicheCard({ image, eager }: { image: string; eager?: boolean }) {
  return (
    <div className="relative h-[10.5rem] w-full shrink-0 overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        width={405}
        height={720}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'low'}
        className="h-full w-full object-cover blur-[4px]"
      />
    </div>
  );
}

/** Deux blocs identiques : translateY(-50%) boucle sans décalage. */
function NicheMarqueeGroup({ ariaHidden = false, eager }: { ariaHidden?: boolean; eager?: boolean }) {
  return (
    <div className="flex w-full flex-col gap-3" aria-hidden={ariaHidden || undefined}>
      {POPULAR_NICHES.map((niche) => (
        <NicheCard key={niche.title} image={niche.image} eager={eager} />
      ))}
    </div>
  );
}

type PopularNichesPanelProps = {
  className?: string;
};

export function PopularNichesPanel({ className = '' }: PopularNichesPanelProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [marqueeActive, setMarqueeActive] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMarqueeActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      ref={rootRef}
      className={`relative isolate overflow-hidden rounded-2xl ${className}`}
      aria-label="Popular niches right now"
    >
      {marqueeActive ? (
        <div
          className="niche-marquee-viewport absolute inset-x-3 inset-y-0 overflow-hidden rounded-2xl"
          aria-hidden="true"
        >
          <div className="niche-marquee-track flex w-full flex-col">
            <NicheMarqueeGroup eager />
            <NicheMarqueeGroup ariaHidden />
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-x-3 inset-y-0 rounded-2xl bg-neutral-100 dark:bg-neutral-900"
          aria-hidden="true"
        />
      )}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-12 rounded-t-2xl bg-gradient-to-b from-white from-10% via-white/55 via-45% to-transparent to-100% dark:from-neutral-950 dark:via-neutral-950/55"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-12 rounded-b-2xl bg-gradient-to-t from-white from-10% via-white/55 via-45% to-transparent to-100% dark:from-neutral-950 dark:via-neutral-950/55"
        aria-hidden="true"
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
        <div>
          <p className="pointer-events-none text-[11px] font-semibold uppercase tracking-[0.14em] text-[#EA580C]">
            Trending
          </p>
          <p className="pointer-events-none mt-2 text-sm font-bold leading-snug text-neutral-900 drop-shadow-sm dark:text-white">
            Popular niches right now
          </p>
          <Link
            href="/marketplace"
            className={`mt-4 inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 ${brandSolidBg}`}
          >
            Consult here
          </Link>
        </div>
      </div>
    </aside>
  );
}
