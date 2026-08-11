'use client';

import { useLayoutEffect, useState } from 'react';
import { MarketplaceCatalogToolbar } from '@/components/marketplace/MarketplaceCatalogToolbar';
import { ProductsCatalog } from '@/components/marketplace/ProductsCatalog';
import { MarketplaceCatalogToolbarSkeleton } from '@/components/marketplace/MarketplaceSkeleton';
import {
  useMarketplaceCatalogParams,
  type MarketplaceSort,
} from '@/components/marketplace/useMarketplaceCatalogParams';

type MarketplaceCatalogSectionProps = {
  favoritesOnly?: boolean;
};

export function MarketplaceCatalogSection({ favoritesOnly = false }: MarketplaceCatalogSectionProps) {
  const {
    q,
    genre,
    type,
    minPrice,
    maxPrice,
    sort,
    hasActiveFilters,
    pushParams,
    resetFilters,
  } = useMarketplaceCatalogParams();

  const [showToolbarSkeleton, setShowToolbarSkeleton] = useState(true);

  useLayoutEffect(() => {
    setShowToolbarSkeleton(true);
  }, [favoritesOnly]);

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-hidden">
      {showToolbarSkeleton ? (
        <MarketplaceCatalogToolbarSkeleton />
      ) : (
        <MarketplaceCatalogToolbar
          q={q}
          genre={genre}
          type={type}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
          hasActiveFilters={hasActiveFilters}
          onSearch={(query) => pushParams({ q: query || undefined, page: '0' })}
          onGenreChange={(value) => pushParams({ genre: value || undefined, page: '0' })}
          onTypeChange={(value) => pushParams({ type: value || undefined, page: '0' })}
          onPriceRangeApply={(min, max) =>
            pushParams({
              minPrice: min === '' ? undefined : min,
              maxPrice: max === '' ? undefined : max,
              page: '0',
            })
          }
          onSortChange={(value: MarketplaceSort) =>
            pushParams({ sort: value === 'popular' ? undefined : value, page: '0' })
          }
          onReset={resetFilters}
        />
      )}
      <ProductsCatalog
        embedded
        favoritesOnly={favoritesOnly}
        onLoadingStateChange={({ loading }) => {
          setShowToolbarSkeleton(loading);
        }}
      />
    </div>
  );
}
