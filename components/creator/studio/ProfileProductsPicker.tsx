'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, listCreatorProducts } from '@/lib/marketplace-api';
import {
  getCuratedProductIds,
  updateCuratedProductIds,
} from '@/lib/creator-profile-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { pushFlashFeedback, pushInsertionLimitFeedback } from '@/stores/flashFeedbackStore';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import {
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';

export const MAX_PORTFOLIO_PRODUCTS = 3;

/** Portfolio products grid — always 2 columns from sm up. */
const portfolioProductsGridClassName =
  'grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2';

type ProfileProductsPickerProps = {
  readOnly?: boolean;
  pickerOpen?: boolean;
  onPickerOpenChange?: (open: boolean) => void;
  onSelectionCountChange?: (count: number) => void;
};

function SelectedProductCard({
  product,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  busy = false,
  readOnly = false,
}: {
  product: MarketplaceProductSummary;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  busy?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="group/selected relative">
      {!readOnly ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          aria-label="Remove product"
          className="absolute right-14 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 opacity-0 shadow-sm transition hover:bg-red-50 group-hover/selected:opacity-100 focus-visible:opacity-100 disabled:opacity-40 dark:bg-neutral-900/95 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" fixedWidth aria-hidden />
        </button>
      ) : null}

      <ProductCard product={product} showCreator={false} />

      {!readOnly ? (
        <div className="mt-2 flex justify-center gap-1 opacity-0 transition group-hover/selected:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp || busy}
            aria-label="Move up"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm text-neutral-700 shadow-sm disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown || busy}
            aria-label="Move down"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm text-neutral-700 shadow-sm disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            ↓
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ProductPickRow({
  product,
  onPick,
  disabled = false,
}: {
  product: MarketplaceProductSummary;
  onPick: () => void;
  disabled?: boolean;
}) {
  const title = product.title?.trim() || 'Untitled product';

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className="flex w-full gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/30 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-orange-500/40"
    >
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {product.thumbnailUrl ? (
          <ProductThumbnailMedia
            url={product.thumbnailUrl}
            alt=""
            fit="cover"
            className="h-full w-full"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-neutral-400">—</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-neutral-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-xs text-neutral-500">
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </div>
      <span className="shrink-0 self-center text-sm font-semibold text-orange-600 dark:text-orange-400">
        Select
      </span>
    </button>
  );
}

export function ProfileProductsPicker({
  readOnly = false,
  pickerOpen: pickerOpenProp,
  onPickerOpenChange,
  onSelectionCountChange,
}: ProfileProductsPickerProps) {
  const [products, setProducts] = useState<MarketplaceProductSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalPickerOpen, setInternalPickerOpen] = useState(false);

  const pickerOpen = pickerOpenProp ?? internalPickerOpen;
  const setPickerOpen = (open: boolean) => {
    onPickerOpenChange?.(open);
    if (pickerOpenProp === undefined) setInternalPickerOpen(open);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsPage, curatedIds] = await Promise.all([
        listCreatorProducts(0, 100),
        getCuratedProductIds(),
      ]);
      setProducts(productsPage.content);
      const owned = new Set(productsPage.content.map((p) => p.id));
      const ids = curatedIds.filter((id) => owned.has(id)).slice(0, MAX_PORTFOLIO_PRODUCTS);
      setSelectedIds(ids);
      setSavedIds(ids);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load products.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    onSelectionCountChange?.(selectedIds.length);
  }, [selectedIds.length, onSelectionCountChange]);

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is MarketplaceProductSummary => product != null),
    [selectedIds, products]
  );

  const availableToPick = useMemo(
    () => products.filter((product) => !selectedIds.includes(product.id)),
    [products, selectedIds]
  );

  const canAddMore = selectedIds.length < MAX_PORTFOLIO_PRODUCTS;

  const persistSelection = useCallback(
    async (nextIds: string[], feedback: { title: string; description?: string }) => {
      const normalized = nextIds.slice(0, MAX_PORTFOLIO_PRODUCTS);
      if (JSON.stringify(normalized) === JSON.stringify(savedIds)) {
        setSelectedIds(normalized);
        return;
      }
      setSaving(true);
      setError(null);
      try {
        const saved = await updateCuratedProductIds(normalized);
        setSelectedIds(saved);
        setSavedIds(saved);
        pushFlashFeedback({
          variant: 'success',
          title: feedback.title,
          description: feedback.description,
        });
      } catch (e) {
        const message = getApiErrorMessage(e, 'Unable to update product selection.');
        setError(message);
        pushFlashFeedback({
          variant: 'error',
          title: 'Product update failed',
          description: message,
        });
        setSelectedIds([...savedIds]);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [savedIds]
  );

  const addProduct = async (id: string) => {
    if (selectedIds.includes(id)) return;
    if (!canAddMore) {
      pushInsertionLimitFeedback({
        limit: MAX_PORTFOLIO_PRODUCTS,
        unit: 'products',
      });
      return;
    }
    const next = [...selectedIds, id].slice(0, MAX_PORTFOLIO_PRODUCTS);
    setPickerOpen(false);
    try {
      await persistSelection(next, { title: 'Product added to portfolio' });
    } catch {
      // already surfaced
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await persistSelection(
        selectedIds.filter((item) => item !== id),
        { title: 'Product removed from portfolio' }
      );
    } catch {
      // already surfaced
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await persistSelection(next, { title: 'Product order updated' });
    } catch {
      // already surfaced
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (readOnly) {
    if (selectedProducts.length === 0) {
      return <p className={profileSectionEmptyClass}>No products selected for the portfolio.</p>;
    }
    return (
      <div className={portfolioProductsGridClassName}>
        {selectedProducts.map((product) => (
          <ProductCard key={product.id} product={product} showCreator={false} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProfileSectionItemCount
        count={selectedIds.length}
        limit={MAX_PORTFOLIO_PRODUCTS}
        unit="products"
      />

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      {pickerOpen && canAddMore ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">Your products</p>
          {availableToPick.length === 0 ? (
            <p className={profileSectionMutedTextClass}>
              All products are already selected, or you have no products yet.
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {availableToPick.map((product) => (
                <ProductPickRow
                  key={product.id}
                  product={product}
                  disabled={saving}
                  onPick={() => void addProduct(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-3">
        {selectedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-5 py-10 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No products selected yet.
            </p>
            {products.length > 0 ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-4 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Choose from my products
              </button>
            ) : (
              <Link
                href="/dashboard/products"
                className="mt-4 inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Create a product
              </Link>
            )}
          </div>
        ) : (
          <div className={portfolioProductsGridClassName}>
            {selectedProducts.map((product, index) => (
              <SelectedProductCard
                key={product.id}
                product={product}
                busy={saving}
                onRemove={() => void removeProduct(product.id)}
                onMoveUp={() => void move(index, -1)}
                onMoveDown={() => void move(index, 1)}
                canMoveUp={index > 0}
                canMoveDown={index < selectedProducts.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
