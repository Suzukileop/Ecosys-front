import { marketplaceProductGridClassName } from '@/components/marketplace/ProductCard';

const skeletonBlock = 'animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]';
const frameClass =
  'overflow-hidden rounded-lg border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#111111]';
const hairline = 'border-black/[0.06] dark:border-white/[0.06]';

function ProductCardSkeleton() {
  return (
    <article className={`min-w-0 ${frameClass}`}>
      <div className={`aspect-[4/3] w-full ${skeletonBlock} rounded-none`} />
      <div className="space-y-3 p-5">
        <div className={`h-5 w-4/5 ${skeletonBlock}`} />
        <div className={`h-4 w-40 ${skeletonBlock}`} />
        <div className="flex gap-1.5">
          <div className={`h-6 w-16 rounded-full ${skeletonBlock}`} />
          <div className={`h-6 w-14 rounded-full ${skeletonBlock}`} />
        </div>
        <div className={`flex items-center justify-between border-t pt-4 ${hairline}`}>
          <div className={`h-5 w-16 ${skeletonBlock}`} />
          <div className={`h-10 w-10 rounded-lg ${skeletonBlock}`} />
        </div>
      </div>
    </article>
  );
}

export function MarketplaceProductGridSkeleton({ count = 6 }: { count?: number }) {
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
    <div className={frameClass} aria-hidden>
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className={`h-12 w-full rounded-lg lg:max-w-md lg:flex-1 ${skeletonBlock}`} />
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <div className={`h-11 w-28 rounded-lg ${skeletonBlock}`} />
          <div className={`h-11 w-28 rounded-lg ${skeletonBlock}`} />
          <div className={`h-11 w-24 rounded-lg ${skeletonBlock}`} />
        </div>
      </div>
    </div>
  );
}

export function MarketplaceCatalogSkeleton({ includeToolbar = true }: { includeToolbar?: boolean }) {
  return (
    <div
      className="min-w-0 max-w-full space-y-6"
      aria-busy="true"
      aria-label="Loading marketplace catalog"
    >
      {includeToolbar && <MarketplaceCatalogToolbarSkeleton />}
      <div className={`h-6 w-36 ${skeletonBlock}`} />
      <MarketplaceProductGridSkeleton />
      <div className={`flex items-center justify-between border-t pt-8 ${hairline}`}>
        <div className={`h-5 w-40 ${skeletonBlock}`} />
        <div className="flex gap-3">
          <div className={`h-11 w-28 rounded-lg ${skeletonBlock}`} />
          <div className={`h-11 w-24 rounded-lg ${skeletonBlock}`} />
        </div>
      </div>
    </div>
  );
}

function PurchaseCardSkeleton() {
  return (
    <article className={frameClass}>
      <div className={`h-52 w-full ${skeletonBlock} rounded-none`} />
      <div className="space-y-3 p-5">
        <div className={`h-5 w-4/5 ${skeletonBlock}`} />
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 shrink-0 rounded-full ${skeletonBlock}`} />
          <div className={`h-4 w-24 ${skeletonBlock}`} />
        </div>
        <div className={`h-4 w-32 ${skeletonBlock}`} />
        <div className={`h-6 w-14 rounded-full ${skeletonBlock}`} />
        <div className={`border-t pt-4 ${hairline}`}>
          <div className={`h-11 w-full rounded-lg ${skeletonBlock}`} />
          <div className={`mx-auto mt-2.5 h-4 w-28 ${skeletonBlock}`} />
        </div>
      </div>
    </article>
  );
}

export function MarketplacePurchasesSkeleton({ count = 6 }: { count?: number }) {
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
    <div
      className={`flex min-h-[3.25rem] flex-wrap items-center justify-between gap-3 border-b ${hairline}`}
      aria-hidden
    >
      <div className="flex gap-6 py-3.5">
        <div className={`h-6 w-20 ${skeletonBlock}`} />
        <div className={`h-6 w-20 ${skeletonBlock}`} />
      </div>
      <div className={`my-2 h-10 w-44 rounded-full ${skeletonBlock}`} />
    </div>
  );
}

export function MarketplaceHubSkeleton() {
  return (
    <main
      className="mx-auto w-full min-w-0 max-w-[1600px] space-y-10 px-4 pb-16 pt-4 sm:px-6 sm:pt-8 2xl:px-0"
      aria-busy="true"
      aria-label="Loading marketplace"
    >
      <div>
        <div className={`h-11 w-56 max-w-full sm:h-12 ${skeletonBlock}`} />
        <div className={`mt-4 h-5 w-80 max-w-full ${skeletonBlock}`} />
      </div>
      <div className="space-y-8">
        <TabNavSkeleton />
        <MarketplaceCatalogSkeleton />
      </div>
    </main>
  );
}
