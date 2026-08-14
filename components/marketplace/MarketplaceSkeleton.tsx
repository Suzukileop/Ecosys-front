import { marketplaceProductGridClassName } from '@/components/marketplace/ProductCard';

const skeletonBlock = 'animate-pulse rounded bg-gray-200 dark:bg-neutral-700';

function ProductCardSkeleton() {
  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className={`h-52 w-full ${skeletonBlock} rounded-none`} />
      <div className="space-y-3 p-4">
        <div className={`h-4 w-4/5 ${skeletonBlock}`} />
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 shrink-0 rounded-full ${skeletonBlock}`} />
          <div className={`h-3 w-24 ${skeletonBlock}`} />
        </div>
        <div className="flex gap-2">
          <div className={`h-5 w-14 rounded-full ${skeletonBlock}`} />
          <div className={`h-5 w-14 rounded-full ${skeletonBlock}`} />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className={`h-5 w-16 ${skeletonBlock}`} />
          <div className={`h-9 w-16 rounded-xl ${skeletonBlock}`} />
        </div>
      </div>
    </article>
  );
}

export function MarketplaceProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={marketplaceProductGridClassName} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function MarketplaceCatalogToolbarSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      aria-hidden
    >
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 dark:border-neutral-800">
        <div className={`h-10 w-full rounded-xl sm:max-w-lg sm:shrink-0 ${skeletonBlock}`} />
        <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
          <div className={`h-10 w-[9.5rem] rounded-xl ${skeletonBlock}`} />
          <div className={`h-10 w-[10.5rem] rounded-xl ${skeletonBlock}`} />
        </div>
      </div>
    </div>
  );
}

export function MarketplaceCatalogSkeleton({ includeToolbar = true }: { includeToolbar?: boolean }) {
  return (
    <div
      className="min-w-0 max-w-full space-y-6 overflow-hidden"
      aria-busy="true"
      aria-label="Loading marketplace catalog"
    >
      {includeToolbar && <MarketplaceCatalogToolbarSkeleton />}
      <MarketplaceProductGridSkeleton />
      <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-neutral-700">
        <div className={`h-4 w-32 ${skeletonBlock}`} />
        <div className="flex gap-2">
          <div className={`h-9 w-24 rounded-lg ${skeletonBlock}`} />
          <div className={`h-9 w-20 rounded-lg ${skeletonBlock}`} />
        </div>
      </div>
    </div>
  );
}

function PurchaseCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className={`h-52 w-full ${skeletonBlock} rounded-none`} />
      <div className="space-y-3 p-5">
        <div className={`h-5 w-4/5 ${skeletonBlock}`} />
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 shrink-0 rounded-full ${skeletonBlock}`} />
          <div className={`h-3 w-24 ${skeletonBlock}`} />
        </div>
        <div className={`h-3 w-32 ${skeletonBlock}`} />
        <div className={`h-5 w-14 rounded-full ${skeletonBlock}`} />
        <div className="border-t border-gray-200 pt-4 dark:border-neutral-700">
          <div className={`h-11 w-full rounded-xl ${skeletonBlock}`} />
          <div className={`mx-auto mt-2.5 h-3 w-28 ${skeletonBlock}`} />
        </div>
      </div>
    </article>
  );
}

export function MarketplacePurchasesSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={marketplaceProductGridClassName} aria-busy="true" aria-label="Loading purchases">
      {Array.from({ length: count }, (_, index) => (
        <PurchaseCardSkeleton key={index} />
      ))}
    </div>
  );
}

function TabNavSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3" aria-hidden>
      <div className="flex flex-wrap gap-2">
        <div className={`h-9 w-24 rounded-full ${skeletonBlock}`} />
        <div className={`h-9 w-24 rounded-full ${skeletonBlock}`} />
      </div>
      <div className="flex gap-2">
        <div className={`h-[3.75rem] w-[9.5rem] rounded-xl ${skeletonBlock}`} />
        <div className={`h-[3.75rem] w-[9.5rem] rounded-xl ${skeletonBlock}`} />
      </div>
    </div>
  );
}

export function MarketplaceHubSkeleton() {
  return (
    <main
      className="w-full min-w-0 max-w-full space-y-6 overflow-hidden"
      aria-busy="true"
      aria-label="Loading marketplace"
    >
      <div className={`h-4 w-80 max-w-full ${skeletonBlock}`} />
      <TabNavSkeleton />
      <MarketplaceCatalogSkeleton />
    </main>
  );
}
