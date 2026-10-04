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
import {
  MARKETPLACE_DEFAULT_FORMAT,
  useMarketplaceCatalogParams,
} from '@/components/marketplace/useMarketplaceCatalogParams';
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
  { id: 'physical', label: 'Material', hint: 'Shipped to buyer' },
  { id: 'virtual', label: 'Digital', hint: 'Delivered online' },
];

function MarketplaceFormatSwitch({
  value,
  onChange,
  compact = false,
}: {
  value: ProductFormat;
  onChange: (format: ProductFormat) => void;
  compact?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Product format"
      className={`inline-flex items-center rounded-full border border-black/[0.08] bg-white dark:border-white/[0.1] dark:bg-[#111111] ${
        compact ? 'gap-0.5 p-0.5' : 'gap-1 p-1'
      }`}
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
            className={`rounded-full font-medium transition-colors duration-200 ${
              compact ? 'px-3 py-1.5 text-[13px]' : 'px-4 py-1.5 text-[14px]'
            } ${
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
        className="mx-5 flex flex-col items-center rounded-lg border border-black/[0.06] bg-white px-6 py-20 text-center dark:border-white/[0.08] dark:bg-[#111111] sm:mx-0"
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
      format: next === MARKETPLACE_DEFAULT_FORMAT ? undefined : next,
      ...(next === 'physical' ? { type: undefined, genre: undefined } : {}),
      page: '0',
    });
  };

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 px-0 pb-16 pt-3 sm:space-y-10 sm:px-6 sm:pt-8 2xl:px-0">
      <header style={STUDIO_FLOAT_IN_STYLE} className="flex items-center justify-between gap-4 px-5 sm:block sm:px-0">
        <h1 className="min-w-0 truncate text-[1.75rem] font-bold leading-tight tracking-tight text-[#111111] dark:text-white sm:text-5xl">
          {copy.title}
        </h1>
        {authLoading ? (
          <div className="mt-4 hidden h-5 w-80 max-w-full animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08] sm:block" />
        ) : (
          <p className="mt-3 hidden text-lg text-neutral-500 dark:text-neutral-400 sm:block">{copy.description}</p>
        )}
        <div className="shrink-0 sm:hidden">
          <MarketplaceFormatSwitch value={format} onChange={setFormat} compact />
        </div>
      </header>

      <div className="space-y-5 sm:space-y-8">
        <div
          className={`min-h-[3.25rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-black/[0.06] px-5 dark:border-white/[0.06] sm:px-0 ${
            !authLoading && tabs.length <= 1 ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {authLoading ? (
            <div className="flex gap-6 py-3.5" aria-hidden>
              <div className="h-6 w-20 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
              <div className="h-6 w-20 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            </div>
          ) : (
            <MarketplaceTabNav tabs={tabs} tab={isTabTransitioning ? previewTab : tab} onSelect={setTab} />
          )}
          <div className="ml-auto hidden shrink-0 py-2 sm:block">
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
