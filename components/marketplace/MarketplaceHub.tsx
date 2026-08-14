'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePendingNavigation } from '@/hooks/usePendingNavigation';
import { MarketplaceCatalogSection } from '@/components/marketplace/MarketplaceCatalogSection';
import { ProductFormatToggle } from '@/components/marketplace/ProductFormatToggle';
import {
  MarketplaceCatalogSkeleton,
  MarketplaceHubSkeleton,
} from '@/components/marketplace/MarketplaceSkeleton';
import { useMarketplaceCatalogParams } from '@/components/marketplace/useMarketplaceCatalogParams';

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
    <nav className="flex flex-wrap items-center gap-2 sm:gap-4" aria-label="Marketplace sections">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${
            tab === item.id
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-800 dark:hover:text-white'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
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
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-gray-700 dark:text-gray-300">Sign in to view this section.</p>
        <a
          href={`/login?redirect=${encodeURIComponent(`/marketplace?tab=${tab}`)}`}
          className="mt-6 inline-flex rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
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
    <main className="w-full min-w-0 max-w-full space-y-6 overflow-hidden">
      {authLoading ? (
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">{copy.description}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {authLoading ? (
          <div className="flex flex-wrap gap-2" aria-hidden>
            <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700" />
            <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700" />
          </div>
        ) : (
          <MarketplaceTabNav tabs={tabs} tab={isTabTransitioning ? previewTab : tab} onSelect={setTab} />
        )}
        <div className="ml-auto shrink-0">
          <ProductFormatToggle value={format} onChange={setFormat} />
        </div>
      </div>

      {authLoading || showTabSkeleton ? (
        <MarketplaceCatalogSkeleton />
      ) : (
        <MarketplaceTabContent tab={tab} needsAuth={needsAuth} />
      )}
    </main>
  );
}

export function MarketplaceHub() {
  return (
    <Suspense
      fallback={
        <div className="min-w-0 max-w-full overflow-x-hidden">
          <MarketplaceHubSkeleton />
        </div>
      }
    >
      <MarketplaceHubContent />
    </Suspense>
  );
}
