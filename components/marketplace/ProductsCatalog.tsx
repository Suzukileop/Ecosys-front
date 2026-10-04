'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { listMyFavoriteTargetIds, listMyLikedTargetIds, listPublicProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ProductCard, marketplaceProductGridClassName } from '@/components/marketplace/ProductCard';
import {
  MARKETPLACE_DEFAULT_PAGE_SIZE,
  MARKETPLACE_PAGE_SIZE_OPTIONS,
  useMarketplaceCatalogParams,
} from '@/components/marketplace/useMarketplaceCatalogParams';
import { MarketplaceProductGridSkeleton } from '@/components/marketplace/MarketplaceSkeleton';
import { MarketplaceCatalogPagination } from '@/components/marketplace/MarketplaceCatalogPagination';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import {
  clearMarketplaceRestoreRequest,
  hasMarketplaceRestoreRequest,
  readMarketplaceReturnPoint,
  saveMarketplaceReturnPoint,
} from '@/lib/marketplace-return';

type ProductsCatalogProps = {
  basePath?: string;
  embedded?: boolean;
  favoritesOnly?: boolean;
  onLoadingStateChange?: (state: { loading: boolean; hasContent: boolean }) => void;
};

const CATALOG_FETCH_DEBOUNCE_MS = 450;
const BACK_NAVIGATION_WINDOW_MS = 4000;

type CatalogSnapshot = {
  products: MarketplaceProductSummary[];
  totalPages: number;
  totalElements: number;
};

const catalogCache = new Map<string, CatalogSnapshot>();

let lastPopStateAt = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    lastPopStateAt = Date.now();
  });
}

function readSavedScroll(cacheKey: string): number | null {
  const point = readMarketplaceReturnPoint();
  return point && point.key === cacheKey ? point.y : null;
}

export function ProductsCatalog({
  basePath = '/marketplace',
  embedded = false,
  favoritesOnly = false,
  onLoadingStateChange,
}: ProductsCatalogProps) {
  const { apiParams, page, size, pushParams, hasActiveFilters } = useMarketplaceCatalogParams(basePath);
  const { user, hasRole, isLoading: authLoading } = useAuth();
  const canFavorite = Boolean(user && hasRole('ROLE_CREATOR'));

  const cacheKey = useMemo(() => JSON.stringify({ apiParams, favoritesOnly }), [apiParams, favoritesOnly]);
  const initialSnapshot = catalogCache.get(cacheKey);

  const [loading, setLoading] = useState(!initialSnapshot);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [products, setProducts] = useState<MarketplaceProductSummary[]>(initialSnapshot?.products ?? []);
  const [totalPages, setTotalPages] = useState(initialSnapshot?.totalPages ?? 0);
  const [totalElements, setTotalElements] = useState(initialSnapshot?.totalElements ?? 0);
  const pendingScrollRestore = useRef(
    typeof window !== 'undefined' &&
      (Date.now() - lastPopStateAt < BACK_NAVIGATION_WINDOW_MS || hasMarketplaceRestoreRequest())
  );
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
    const cached = catalogCache.get(cacheKey);
    if (cached) {
      setLoading(false);
      setProducts(cached.products);
      setTotalPages(cached.totalPages);
      setTotalElements(cached.totalElements);
      return;
    }
    setLoading(true);
    setProducts([]);
    setTotalPages(0);
    setTotalElements(0);
  }, [cacheKey]);

  useLayoutEffect(() => {
    if (!pendingScrollRestore.current || loading || products.length === 0) return;
    pendingScrollRestore.current = false;
    const fromBackLink = hasMarketplaceRestoreRequest();
    clearMarketplaceRestoreRequest();
    const y = readSavedScroll(cacheKey) ?? (fromBackLink ? 0 : null);
    if (y == null) return;
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }));
    return () => window.cancelAnimationFrame(frame);
  }, [cacheKey, loading, products.length]);

  const rememberScroll = useCallback(() => {
    saveMarketplaceReturnPoint({
      key: cacheKey,
      y: window.scrollY,
      url: `${window.location.pathname}${window.location.search}`,
    });
  }, [cacheKey]);

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
        catalogCache.set(cacheKey, {
          products: data.content,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
        });
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
  }, [apiParams, favoritesOnly, reloadKey, cacheKey]);

  const retryLoad = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    onLoadingStateChange?.({ loading, hasContent: products.length > 0 });
  }, [loading, onLoadingStateChange, products.length]);

  const embeddedInset = embedded ? 'mx-5 sm:mx-0' : '';
  const embeddedPad = embedded ? 'px-5 sm:px-0' : '';

  const emptyState = useMemo(
    () => (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border border-black/[0.06] bg-white px-6 py-20 text-center dark:border-white/[0.08] dark:bg-[#111111] ${embeddedInset}`}
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
    [favoritesOnly, hasActiveFilters, embeddedInset]
  );

  const sectionTitle = favoritesOnly ? 'Favorites' : 'Products';

  const catalogBody = (
    <>
      <h2 className={`flex min-h-8 items-center text-lg font-bold tracking-[-0.01em] text-[#111111] dark:text-neutral-100 ${embeddedPad}`}>
        {sectionTitle}
        {!loading && !error ? ` · ${String(totalElements).padStart(2, '0')}` : ''}
      </h2>

      {loading ? (
        <MarketplaceProductGridSkeleton />
      ) : error ? (
        <div
          role="alert"
          className={`flex flex-col items-center justify-center rounded-lg border border-black/[0.06] bg-white px-6 py-20 text-center dark:border-white/[0.08] dark:bg-[#111111] ${embeddedInset}`}
          style={STUDIO_FLOAT_IN_STYLE}
        >
          <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-black/[0.04] text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 8v4.5M12 16h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </span>
          <h2 className="text-xl font-bold tracking-tight text-[#111111] dark:text-white">
            {favoritesOnly ? 'Couldn’t load your favorites' : 'Couldn’t load products'}
          </h2>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">{error}</p>
          <button
            type="button"
            onClick={retryLoad}
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#111111] px-5 text-[14px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 11a8 8 0 1 0-2.34 5.66" />
              <path d="M20 4v7h-7" />
            </svg>
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        emptyState
      ) : (
        <>
          <div className={marketplaceProductGridClassName} style={STUDIO_FLOAT_IN_STYLE} onClickCapture={rememberScroll}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                initialFavorited={favoritesOnly || favoriteIds.has(product.id)}
                onFavoritedChange={onFavoritedChange}
                initialLiked={likedIds.has(product.id)}
                onLikedChange={onLikedChange}
                flushOnMobile={embedded}
              />
            ))}
          </div>

          <div className={embeddedPad}>
          <MarketplaceCatalogPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={size}
            pageSizeOptions={MARKETPLACE_PAGE_SIZE_OPTIONS}
            noun={favoritesOnly ? 'favorites' : 'products'}
            onPageChange={(next) => pushParams({ page: String(next) })}
            onPageSizeChange={(next) =>
              pushParams({ size: next === MARKETPLACE_DEFAULT_PAGE_SIZE ? undefined : String(next), page: '0' })
            }
          />
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
