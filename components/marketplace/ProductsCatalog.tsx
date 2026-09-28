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
import { MarketplaceFilterDropdown } from '@/components/marketplace/MarketplaceFilterDropdown';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceProductSummary } from '@/types/marketplace';

const PAGER_BUTTON_CLASS =
  'inline-flex h-11 items-center rounded-lg border border-black/[0.12] px-4 text-[15px] font-medium text-[#111111] transition-colors hover:border-black/25 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.12] dark:text-white dark:hover:border-white/25';

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
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-black/[0.06] bg-white px-6 py-20 text-center dark:border-white/[0.08] dark:bg-[#111111]"
        style={STUDIO_FLOAT_IN_STYLE}
      >
        <span aria-hidden className="mb-5 h-1.5 w-1.5 rounded-full bg-[#FF5722]" />
        <h2 className="text-xl font-bold tracking-tight text-[#111111] dark:text-white">
          {favoritesOnly ? 'No favorite products found' : 'No products found'}
        </h2>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {favoritesOnly ? (
            hasActiveFilters ? (
              'Try adjusting your search or filters, or save products from the catalog.'
            ) : (
              <>
                You have not saved any products yet. Browse the{' '}
                <Link
                  href="/marketplace"
                  className="font-medium text-[#111111] underline-offset-4 transition-colors hover:text-[#FF5722] dark:text-white"
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
                href="/marketplace/my-products"
                className="font-medium text-[#111111] transition-colors hover:text-[#FF5722] dark:text-white"
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

  const sectionTitle = favoritesOnly ? 'Favorites' : 'Products';

  const catalogBody = (
    <>
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <h2 className="flex min-h-8 items-center text-lg font-bold tracking-[-0.01em] text-[#111111] dark:text-neutral-100">
        {sectionTitle}
        {!loading ? ` · ${String(totalElements).padStart(2, '0')}` : ''}
      </h2>

      {loading ? (
        <MarketplaceProductGridSkeleton />
      ) : products.length === 0 ? (
        emptyState
      ) : (
        <>
          <div className={marketplaceProductGridClassName} style={STUDIO_FLOAT_IN_STYLE}>
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

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] pt-8 dark:border-white/[0.06]">
            <p className="text-[15px] text-neutral-500 dark:text-neutral-400">
              Page {page + 1}
              {totalPages > 0 ? ` of ${totalPages}` : ''}
              {totalElements > 0
                ? ` · ${totalElements} ${favoritesOnly ? 'favorites' : 'products'}`
                : ''}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <MarketplaceFilterDropdown
                id="catalog-page-size"
                label="Per page"
                value={String(size)}
                onChange={(value) => pushParams({ size: value, page: '0' })}
                options={MARKETPLACE_PAGE_SIZE_OPTIONS.map((option) => ({
                  value: String(option),
                  label: String(option),
                }))}
                defaultValue=""
                clearable={false}
                placement="top"
                align="right"
              />
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => pushParams({ page: String(page - 1) })}
                className={PAGER_BUTTON_CLASS}
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={totalPages > 0 && page >= totalPages - 1}
                onClick={() => pushParams({ page: String(page + 1) })}
                className={PAGER_BUTTON_CLASS}
              >
                Next →
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
    <main className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-2 sm:px-0">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-[#111111] dark:text-white">Marketplace</h1>
        <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
          Browse published digital products from creators — templates, courses, presets, and more.
        </p>
      </div>
      {catalogBody}
    </main>
  );
}
