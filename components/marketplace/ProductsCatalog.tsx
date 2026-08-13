'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { listMyFavoriteTargetIds, listMyLikedTargetIds, listPublicProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ProductCard, marketplaceProductGridClassName } from '@/components/marketplace/ProductCard';
import {
  MARKETPLACE_PAGE_SIZE_OPTIONS,
  useMarketplaceCatalogParams,
} from '@/components/marketplace/useMarketplaceCatalogParams';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { MarketplaceProductGridSkeleton } from '@/components/marketplace/MarketplaceSkeleton';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceProductSummary } from '@/types/marketplace';

type ProductsCatalogProps = {
  basePath?: string;
  embedded?: boolean;
  favoritesOnly?: boolean;
  onLoadingStateChange?: (state: { loading: boolean; hasContent: boolean }) => void;
};

const CATALOG_FETCH_DEBOUNCE_MS = 450;

export function ProductsCatalog({
  basePath = '/marketplace',
  embedded = false,
  favoritesOnly = false,
  onLoadingStateChange,
}: ProductsCatalogProps) {
  const { apiParams, page, size, pushParams, hasActiveFilters } = useMarketplaceCatalogParams(basePath);
  const { user, hasRole, isLoading: authLoading } = useAuth();
  const canFavorite = Boolean(user && hasRole('ROLE_CREATOR'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<MarketplaceProductSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const favoritesLoaded = useRef(false);
  const likesLoaded = useRef(false);

  useEffect(() => {
    if (authLoading || !user?.id) {
      setLikedIds(new Set());
      likesLoaded.current = false;
      return;
    }

    if (likesLoaded.current) return;

    let cancelled = false;
    void listMyLikedTargetIds('PRODUCT')
      .then((ids) => {
        if (!cancelled) {
          setLikedIds(new Set(ids));
          likesLoaded.current = true;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLikedIds(new Set());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (authLoading || !canFavorite) {
      setFavoriteIds(new Set());
      favoritesLoaded.current = false;
      return;
    }

    if (favoritesLoaded.current) return;

    let cancelled = false;
    void listMyFavoriteTargetIds('PRODUCT')
      .then((ids) => {
        if (!cancelled) {
          setFavoriteIds(new Set(ids));
          favoritesLoaded.current = true;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFavoriteIds(new Set());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, canFavorite, user?.id]);

  const onFavoritedChange = useCallback(
    (productId: string, favorited: boolean) => {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (favorited) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
      if (favoritesOnly && !favorited) {
        setProducts((prev) => prev.filter((product) => product.id !== productId));
        setTotalElements((prev) => Math.max(0, prev - 1));
      }
    },
    [favoritesOnly]
  );

  const onLikedChange = useCallback((productId: string, liked: boolean) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (liked) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    setLoading(true);
    setProducts([]);
    setTotalPages(0);
    setTotalElements(0);
  }, [apiParams, favoritesOnly]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        setError(null);
        const data = await listPublicProducts({
          ...apiParams,
          favoritesOnly: favoritesOnly || undefined,
        });
        if (cancelled) return;
        setProducts(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (e) {
        if (cancelled) return;
        setError(getApiErrorMessage(e, 'Unable to load products.'));
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, CATALOG_FETCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [apiParams, favoritesOnly]);

  useEffect(() => {
    onLoadingStateChange?.({ loading, hasContent: products.length > 0 });
  }, [loading, onLoadingStateChange, products.length]);

  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {favoritesOnly ? 'No favorite products found' : 'No products found'}
        </h2>
        <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
          {favoritesOnly ? (
            hasActiveFilters ? (
              'Try adjusting your search or filters, or save products from the catalog.'
            ) : (
              <>
                You have not saved any products yet. Browse the{' '}
                <Link
                  href="/marketplace"
                  className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  product catalog
                </Link>{' '}
                and tap the bookmark to add favorites.
              </>
            )
          ) : (
            <>
              Only published products appear here. Creators publish from{' '}
              <Link
                href="/dashboard/products"
                className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Creator studio → Products
              </Link>
              .
            </>
          )}
        </p>
      </div>
    ),
    [favoritesOnly, hasActiveFilters]
  );

  const catalogBody = (
    <>
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <MarketplaceProductGridSkeleton />
      ) : products.length === 0 ? (
        emptyState
      ) : (
        <>
          <div className={marketplaceProductGridClassName}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                initialFavorited={favoritesOnly || favoriteIds.has(product.id)}
                onFavoritedChange={onFavoritedChange}
                initialLiked={likedIds.has(product.id)}
                onLikedChange={onLikedChange}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-neutral-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {page + 1}
              {totalPages > 0 ? ` / ${totalPages}` : ''}
              {totalElements > 0
                ? ` · ${totalElements} ${favoritesOnly ? 'favorites' : 'products'}`
                : ''}
            </p>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Per page</span>
              <select
                value={size}
                onChange={(e) =>
                  pushParams({ size: e.target.value, page: '0' })
                }
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm font-medium text-gray-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-gray-200"
                aria-label="Products per page"
              >
                {MARKETPLACE_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => pushParams({ page: String(page - 1) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 dark:border-neutral-600 dark:text-gray-200"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={totalPages > 0 && page >= totalPages - 1}
                onClick={() => pushParams({ page: String(page + 1) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 dark:border-neutral-600 dark:text-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  if (embedded) {
    return <div className="space-y-6">{catalogBody}</div>;
  }

  return (
    <main className="w-full space-y-8 py-2">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Browse published digital products from creators — templates, courses, presets, and more.
        </p>
      </div>
      {catalogBody}
    </main>
  );
}
