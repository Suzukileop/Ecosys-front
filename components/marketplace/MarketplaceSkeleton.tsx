import { marketplaceProductGridClassName, marketplaceRailProductGridClassName } from '@/components/marketplace/ProductCard';

const skeletonBlock = 'animate-pulse bg-[#EFF3F4] dark:bg-[#202327]';
const frameClass = 'overflow-hidden !rounded-none bg-[#F7F9F9] dark:bg-[#16181C]';
const hairline = 'border-transparent';

function ProductCardSkeleton() {
  return (
    <article className={`min-w-0 ${frameClass}`}>
      <div className={`aspect-[4/3] w-full ${skeletonBlock} rounded-none`} />
      <div className="space-y-3 p-5">
        <div className={`h-3 w-16 ${skeletonBlock}`} />
        <div className={`h-5 w-4/5 ${skeletonBlock}`} />
        <div className={`h-4 w-40 ${skeletonBlock}`} />
        <div className={`flex items-center justify-between border-t pt-4 ${hairline}`}>
          <div className={`h-5 w-16 ${skeletonBlock}`} />
          <div className={`h-10 w-10 rounded-full ${skeletonBlock}`} />
        </div>
      </div>
    </article>
  );
}

export function MarketplaceProductGridSkeleton({
  count = 6,
  className = marketplaceProductGridClassName,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

function ProductListRowSkeleton() {
  return (
    <div className={`flex items-start gap-3 p-3 sm:items-center sm:gap-5 sm:p-4 ${frameClass}`}>
      <div className={`aspect-square w-24 shrink-0 sm:aspect-[4/3] sm:w-44 md:w-52 ${skeletonBlock}`} />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className={`h-3 w-16 ${skeletonBlock}`} />
        <div className={`h-5 w-3/5 ${skeletonBlock}`} />
        <div className={`h-4 w-40 ${skeletonBlock}`} />
        <div className={`hidden h-4 w-4/5 sm:block ${skeletonBlock}`} />
      </div>
      <div className="hidden w-36 shrink-0 flex-col items-end gap-2 sm:flex">
        <div className={`h-3 w-12 ${skeletonBlock}`} />
        <div className={`h-5 w-20 ${skeletonBlock}`} />
      </div>
    </div>
  );
}

/** The Products page's List view while it loads: the row shape, one per line. */
export function MarketplaceProductListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:gap-3" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <ProductListRowSkeleton key={index} />
      ))}
    </div>
  );
}

/** Mirrors the Products page: the News frame — section line + grid, then the rail from lg. */
export function MarketplaceHubSkeleton() {
  return (
    <div
      className="news-theme news-feed news-mono w-full pb-24 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3"
      aria-busy="true"
      aria-label="Loading products"
    >
      <div className="mx-auto grid w-full max-w-[1240px] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2 px-5 pt-1 sm:px-0 lg:hidden">
            <div className={`h-11 min-w-0 flex-1 rounded-full ${skeletonBlock}`} />
            <div className={`h-11 w-11 shrink-0 rounded-full ${skeletonBlock}`} />
          </div>
          <div className="flex min-h-8 items-center justify-between gap-4 px-5 pt-3 sm:px-1 lg:pt-0">
            <div className={`h-3 w-40 ${skeletonBlock}`} />
            <div className={`h-3 w-28 ${skeletonBlock}`} />
          </div>
          <MarketplaceProductGridSkeleton className={marketplaceRailProductGridClassName} />
        </div>
        <div className="hidden flex-col gap-6 lg:flex" aria-hidden>
          <div className={`h-11 rounded-full ${skeletonBlock}`} />
          <div className={`h-[148px] ${skeletonBlock}`} />
          <div className={`h-[200px] ${skeletonBlock}`} />
        </div>
      </div>
    </div>
  );
}
