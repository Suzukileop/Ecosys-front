'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePendingNavigation } from '@/hooks/usePendingNavigation';
import { MarketplaceCatalogSection } from '@/components/marketplace/MarketplaceCatalogSection';
import { PurchasesPanel } from '@/components/marketplace/PurchasesLibrary';
import {
  MarketplaceCatalogSkeleton,
  MarketplaceHubSkeleton,
  MarketplacePurchasesSkeleton,
} from '@/components/marketplace/MarketplaceSkeleton';

export type MarketplaceTab = 'products' | 'favorites' | 'purchases';

const TAB_COPY: Record<MarketplaceTab, { title: string; description: string }> = {
  products: {
    title: 'Products',
    description: 'Browse digital products published by creators.',
  },
  favorites: {
    title: 'Favorites',
    description: 'Your saved products — same catalog view with search and filters.',
  },
  purchases: {
    title: 'Purchases',
    description: 'Your digital library. Download your files securely anytime.',
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

  if (tab === 'products' || tab === 'favorites') {
    return <MarketplaceCatalogSection favoritesOnly={tab === 'favorites'} />;
  }

  return <PurchasesPanel />;
}

function MarketplaceHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasRole, user, isLoading: authLoading } = useAuth();

  const rawTab = searchParams.get('tab') ?? 'products';
  const tab: MarketplaceTab =
    rawTab === 'favorites' || rawTab === 'purchases' ? rawTab : 'products';
  const { isTransitioning: isTabTransitioning, startTransition: startTabTransition, preview: previewTab } =
    usePendingNavigation(tab);

  const clientTabs = hasRole('ROLE_CREATOR');
  const tabs: { id: MarketplaceTab; label: string }[] = [
    { id: 'products', label: 'Products' },
    ...(clientTabs
      ? [
          { id: 'favorites' as const, label: 'Favorites' },
          { id: 'purchases' as const, label: 'Purchases' },
        ]
      : []),
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

  const needsAuth = (tab === 'favorites' || tab === 'purchases') && !user;
  const copy = TAB_COPY[tab];
  const showTabSkeleton = authLoading || isTabTransitioning;

  return (
    <main className="w-full min-w-0 max-w-full space-y-6 overflow-hidden">
      {authLoading ? (
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">{copy.description}</p>
      )}

      {authLoading ? (
        <div className="flex flex-wrap gap-2" aria-hidden>
          <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700" />
          <div className="h-9 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700" />
        </div>
      ) : (
        <MarketplaceTabNav tabs={tabs} tab={isTabTransitioning ? previewTab : tab} onSelect={setTab} />
      )}

      {authLoading ? (
        tab === 'purchases' ? <MarketplacePurchasesSkeleton /> : <MarketplaceCatalogSkeleton />
      ) : showTabSkeleton ? (
        previewTab === 'purchases' ? <MarketplacePurchasesSkeleton /> : <MarketplaceCatalogSkeleton />
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
