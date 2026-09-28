'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePendingNavigation } from '@/hooks/usePendingNavigation';
import { MarketplaceCatalogSection } from '@/components/marketplace/MarketplaceCatalogSection';
import {
  MarketplaceCatalogSkeleton,
  MarketplaceHubSkeleton,
} from '@/components/marketplace/MarketplaceSkeleton';
import { useMarketplaceCatalogParams } from '@/components/marketplace/useMarketplaceCatalogParams';
import type { ProductFormat } from '@/components/marketplace/product-editor-steps';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';

export type MarketplaceTab = 'products' | 'favorites';

const TAB_COPY: Record<MarketplaceTab, { title: string; description: string }> = {
  products: {
    title: 'Products',
    description: 'Browse products published by creators.',
  },
  favorites: {
    title: 'Favorites',
    description: 'Your saved products — same catalog view with search and filters.',
  },
};

type MarketplaceTabNavProps = {
  tabs: { id: MarketplaceTab; label: string }[];
  tab: MarketplaceTab;
  onSelect: (tab: MarketplaceTab) => void;
};

function MarketplaceTabNav({ tabs, tab, onSelect }: MarketplaceTabNavProps) {
  if (tabs.length <= 1) return null;

  return (
    <nav className="flex min-w-0 items-stretch gap-6" aria-label="Marketplace sections">
      {tabs.map((item) => {
        const isActive = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`relative shrink-0 whitespace-nowrap py-3.5 text-base transition-colors duration-200 ${
              isActive
                ? 'font-semibold text-[#111111] dark:text-white'
                : 'font-medium text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {item.label}
            {isActive ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#FF5722]" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

const FORMAT_OPTIONS: { id: ProductFormat; label: string; hint: string }[] = [
  { id: 'virtual', label: 'Virtual', hint: 'Delivered online' },
  { id: 'physical', label: 'Physical', hint: 'Shipped to buyer' },
];

function MarketplaceFormatSwitch({
  value,
  onChange,
}: {
  value: ProductFormat;
  onChange: (format: ProductFormat) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Product format"
      className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-white p-1 dark:border-white/[0.1] dark:bg-[#111111]"
    >
      {FORMAT_OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.hint}
            onClick={() => {
              if (!selected) onChange(option.id);
            }}
            className={`rounded-full px-4 py-1.5 text-[14px] font-medium transition-colors duration-200 ${
              selected
                ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function MarketplaceTabContent({
  tab,
  needsAuth,
}: {
  tab: MarketplaceTab;
  needsAuth: boolean;
}) {
  if (needsAuth) {
    return (
      <div
        className="flex flex-col items-center rounded-lg border border-black/[0.06] bg-white px-6 py-20 text-center dark:border-white/[0.08] dark:bg-[#111111]"
        style={STUDIO_FLOAT_IN_STYLE}
      >
        <span aria-hidden className="mb-5 h-1.5 w-1.5 rounded-full bg-[#FF5722]" />
        <p className="text-lg font-semibold text-[#111111] dark:text-white">Sign in to view this section.</p>
        <p className="mt-2 text-[15px] text-neutral-500 dark:text-neutral-400">
          Your saved products are kept with your account.
        </p>
        <a
          href={`/login?redirect=${encodeURIComponent(`/marketplace?tab=${tab}`)}`}
          className="mt-8 inline-flex rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
        >
          Sign in
        </a>
      </div>
    );
  }

  return <MarketplaceCatalogSection favoritesOnly={tab === 'favorites'} />;
}

function MarketplaceHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasRole, user, isLoading: authLoading } = useAuth();
  const { format, pushParams } = useMarketplaceCatalogParams();

  const rawTab = searchParams.get('tab') ?? 'products';
  const tab: MarketplaceTab = rawTab === 'favorites' ? 'favorites' : 'products';
  const { isTransitioning: isTabTransitioning, startTransition: startTabTransition, preview: previewTab } =
    usePendingNavigation(tab);

  useEffect(() => {
    if (rawTab !== 'purchases') return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tab');
    const qs = params.toString();
    router.replace(qs ? `/marketplace?${qs}` : '/marketplace');
  }, [rawTab, router, searchParams]);

  const clientTabs = hasRole('ROLE_CREATOR');
  const tabs: { id: MarketplaceTab; label: string }[] = [
    { id: 'products', label: 'Products' },
    ...(clientTabs ? [{ id: 'favorites' as const, label: 'Favorites' }] : []),
  ];

  const setTab = (next: MarketplaceTab) => {
    if (next === tab) return;
    startTabTransition(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'products') {
      params.delete('tab');
    } else {
      params.set('tab', next);
    }
    const qs = params.toString();
    router.replace(qs ? `/marketplace?${qs}` : '/marketplace');
  };

  const needsAuth = tab === 'favorites' && !user;
  const copy = TAB_COPY[tab];
  const showTabSkeleton = authLoading || isTabTransitioning;

  const setFormat = (next: typeof format) => {
    if (next === format) return;
    pushParams({
      format: next === 'virtual' ? undefined : next,
      ...(next === 'physical' ? { type: undefined, genre: undefined } : {}),
      page: '0',
    });
  };

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1280px] space-y-10 px-4 pb-16 pt-4 sm:px-0 sm:pt-8">
      <header style={STUDIO_FLOAT_IN_STYLE}>
        <h1 className="text-4xl font-bold tracking-tight text-[#111111] dark:text-white sm:text-5xl">
          {copy.title}
        </h1>
        {authLoading ? (
          <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        ) : (
          <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400 sm:text-lg">{copy.description}</p>
        )}
      </header>

      <div className="space-y-8">
        <div className="flex min-h-[3.25rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          {authLoading ? (
            <div className="flex gap-6 py-3.5" aria-hidden>
              <div className="h-6 w-20 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
              <div className="h-6 w-20 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            </div>
          ) : (
            <MarketplaceTabNav tabs={tabs} tab={isTabTransitioning ? previewTab : tab} onSelect={setTab} />
          )}
          <div className="ml-auto shrink-0 py-2">
            <MarketplaceFormatSwitch value={format} onChange={setFormat} />
          </div>
        </div>

        {authLoading || showTabSkeleton ? (
          <MarketplaceCatalogSkeleton />
        ) : (
          <MarketplaceTabContent tab={tab} needsAuth={needsAuth} />
        )}
      </div>
    </main>
  );
}

export function MarketplaceHub() {
  return (
    <Suspense
      fallback={<MarketplaceHubSkeleton />}
    >
      <MarketplaceHubContent />
    </Suspense>
  );
}
