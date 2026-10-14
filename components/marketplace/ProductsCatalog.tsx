'use client';

import { trPlural } from '@/lib/i18n/active';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { listMyFavoriteTargetIds, listMyLikedTargetIds, listPublicProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ProductCard, marketplaceProductGridClassName } from '@/components/marketplace/ProductCard';
import {
  MARKETPLACE_DEFAULT_PAGE_SIZE,
  MARKETPLACE_PAGE_SIZE_OPTIONS,
  useMarketplaceCatalogParams,
} from '@/components/marketplace/useMarketplaceCatalogParams';
import { MarketplaceProductGridSkeleton, MarketplaceProductListSkeleton } from '@/components/marketplace/MarketplaceSkeleton';
import { ProductListRow } from '@/components/marketplace/ProductListRow';
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
import { useT } from '@/lib/i18n/I18nProvider';

type ProductsCatalogProps = {
  basePath?: string;
  embedded?: boolean;
  favoritesOnly?: boolean;
  onLoadingStateChange?: (state: { loading: boolean; hasContent: boolean }) => void;
  /** Overrides the grid (the Products page fits it to the column beside its rail). */
  gridClassName?: string;
  /** `list`: one product per row (ProductListRow) instead of grid cards. */
  layout?: 'grid' | 'list';
  /** Embedded: replaces the quiet result count with the host's section line; `total` is null while loading. */
  header?: (info: { total: number | null }) => ReactNode;
  /** Embedded: the result count once loaded (null while loading or on error). */
  onTotalChange?: (total: number | null) => void;
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

const fetchLikedProducts = (ids: string[]) => listMyLikedTargetIds('PRODUCT', ids);
const fetchFavoritedProducts = (ids: string[]) => listMyFavoriteTargetIds('PRODUCT', ids);

/**
 * Which of the listed products the viewer has marked. Only products not asked about yet are sent,
 * so paging through the catalogue costs one small request per new page — never the whole history.
 */
function useViewerMarkedIds(
  viewerId: string | null,
  productIds: string[],
  fetchMarked: (ids: string[]) => Promise<string[]>
) {
  const [marked, setMarked] = useState<Set<string>>(() => new Set());
  const checkedRef = useRef<{ viewerId: string | null; ids: Set<string> }>({ viewerId: null, ids: new Set() });
  const idsKey = productIds.join(',');

  useEffect(() => {
    if (checkedRef.current.viewerId !== viewerId) {
      checkedRef.current = { viewerId, ids: new Set() };
      setMarked(new Set());
    }
    if (!viewerId) return;

    const tracker = checkedRef.current;
    const pending = idsKey.split(',').filter((id) => id && !tracker.ids.has(id));
    if (pending.length === 0) return;
    pending.forEach((id) => tracker.ids.add(id));

    let settled = false;
    void fetchMarked(pending)
      .then((ids) => {
        settled = true;
        if (checkedRef.current !== tracker || ids.length === 0) return;
        setMarked((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.add(id));
          return next;
        });
      })
      .catch(() => {
        settled = true;
        pending.forEach((id) => tracker.ids.delete(id));
      });

    return () => {
      if (!settled) pending.forEach((id) => tracker.ids.delete(id));
    };
  }, [viewerId, idsKey, fetchMarked]);

  return [marked, setMarked] as const;
}

export function ProductsCatalog({
  basePath = '/marketplace',
  embedded = false,
  favoritesOnly = false,
  onLoadingStateChange,
  gridClassName = marketplaceProductGridClassName,
  layout = 'grid',
  header,
  onTotalChange,
}: ProductsCatalogProps) {
  const t = useT();
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
  const productIds = useMemo(() => products.map((product) => product.id), [products]);
  const viewerId = !authLoading && user?.id ? user.id : null;
  const [likedIds, setLikedIds] = useViewerMarkedIds(viewerId, productIds, fetchLikedProducts);
  const [favoriteIds, setFavoriteIds] = useViewerMarkedIds(
    canFavorite ? viewerId : null,
    productIds,
    fetchFavoritedProducts
  );

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
        setError(getApiErrorMessage(e, t('Unable to load products.')));
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
  }, [apiParams, favoritesOnly, reloadKey, cacheKey, t]);

  const retryLoad = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    onLoadingStateChange?.({ loading, hasContent: products.length > 0 });
  }, [loading, onLoadingStateChange, products.length]);

  const shownTotal = loading || error ? null : totalElements;
  useEffect(() => {
    onTotalChange?.(shownTotal);
  }, [onTotalChange, shownTotal]);

  const embeddedInset = '';
  const embeddedPad = embedded ? 'px-4 sm:px-0' : '';

  const emptyState = useMemo(
    () => (
      <div
        className={`flex flex-col items-center justify-center bg-[color:var(--gn-surface)] px-6 py-16 text-center ${embeddedInset}`}
        style={STUDIO_FLOAT_IN_STYLE}
      >
        <h2 className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">
          {favoritesOnly ? t('No favorite products found') : t('No products found')}
        </h2>
        <p className="mt-1.5 max-w-md text-[15px] leading-5 text-[color:var(--gn-ink2)]">
          {favoritesOnly ? (
            hasActiveFilters ? (
              t('Try adjusting your search or filters, or save products from the catalog.')
            ) : (
              <>
                {t('You have not saved any products yet. Browse the')}{' '}
                <Link
                  href="/marketplace"
                  className="font-semibold text-[color:var(--gn-ink)] underline-offset-4 hover:underline"
                >
                  {t('product catalog')}
                </Link>{' '}
                {t('and tap the bookmark to add favorites.')}
              </>
            )
          ) : hasActiveFilters ? (
            t('Try a different search, or widen the filters.')
          ) : (
            <>
              {t('Only published products appear here. Creators publish them from')}{' '}
              <Link
                href="/my-products"
                className="font-semibold text-[color:var(--gn-ink)] underline-offset-4 hover:underline"
              >
                {t('My products')}
              </Link>
              .
            </>
          )}
        </p>
      </div>
    ),
    [favoritesOnly, hasActiveFilters, embeddedInset, t]
  );

  const sectionTitle = favoritesOnly ? t('Favorites') : t('Products');

  const catalogBody = (
    <>
      {embedded && header ? (
        header({ total: shownTotal })
      ) : embedded ? (
        // The page title already says "Products": under the toolbar a quiet result count is enough.
        <h2 className={`min-h-5 text-[14px] font-medium leading-5 text-[color:var(--gn-ink2)] ${embeddedPad}`}>
          <span className="sr-only">{sectionTitle}: </span>
          {!loading && !error ? (
            <span className="tabular-nums" aria-live="polite">
              {totalElements} {trPlural(totalElements, 'result', 'results')}
            </span>
          ) : null}
        </h2>
      ) : (
        <h2 className={`flex min-h-8 items-baseline gap-2 text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)] ${embeddedPad}`}>
          {sectionTitle}
          {!loading && !error && totalElements > 0 ? (
            <span className="text-[15px] font-medium tabular-nums text-[color:var(--gn-ink2)]">{totalElements}</span>
          ) : null}
        </h2>
      )}

      {loading ? (
        layout === 'list' ? (
          <MarketplaceProductListSkeleton />
        ) : (
          <MarketplaceProductGridSkeleton className={gridClassName} />
        )
      ) : error ? (
        <div
          role="alert"
          className={`flex flex-col items-center justify-center bg-[color:var(--gn-surface)] px-6 py-16 text-center ${embeddedInset}`}
          style={STUDIO_FLOAT_IN_STYLE}
        >
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gn-inset)] text-[color:var(--gn-ink2)]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 8v4.5M12 16h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </span>
          <h2 className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">
            {favoritesOnly ? t('Couldn’t load your favorites') : t('Couldn’t load products')}
          </h2>
          <p className="mt-1.5 max-w-md text-[15px] leading-5 text-[color:var(--gn-ink2)]">{error}</p>
          <button
            type="button"
            onClick={retryLoad}
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--gn-primary)] px-6 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 11a8 8 0 1 0-2.34 5.66" />
              <path d="M20 4v7h-7" />
            </svg>
            {t('Try again')}
          </button>
        </div>
      ) : products.length === 0 ? (
        emptyState
      ) : (
        <>
          <div
            className={layout === 'list' ? 'flex min-w-0 flex-col gap-2 sm:gap-3' : gridClassName}
            style={STUDIO_FLOAT_IN_STYLE}
            data-rail-fold="cards"
            onClickCapture={rememberScroll}
          >
            {products.map((product) =>
              layout === 'list' ? (
                <ProductListRow
                  key={product.id}
                  product={product}
                  initialFavorited={favoritesOnly || favoriteIds.has(product.id)}
                  onFavoritedChange={onFavoritedChange}
                  initialLiked={likedIds.has(product.id)}
                  onLikedChange={onLikedChange}
                />
              ) : (
              <ProductCard
                key={product.id}
                product={product}
                initialFavorited={favoritesOnly || favoriteIds.has(product.id)}
                onFavoritedChange={onFavoritedChange}
                initialLiked={likedIds.has(product.id)}
                onLikedChange={onLikedChange}
                flushOnMobile={embedded}
              />
              )
            )}
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
    return <div className="space-y-3 sm:space-y-5">{catalogBody}</div>;
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-2 sm:px-0">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-[#111111] dark:text-white">{t('Marketplace')}</h1>
        <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
          {t('Browse published digital products from creators — templates, courses, presets, and more.')}
        </p>
      </div>
      {catalogBody}
    </main>
  );
}
