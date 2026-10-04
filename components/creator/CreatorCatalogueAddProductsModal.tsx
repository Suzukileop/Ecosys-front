'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { formatPrice } from '@/lib/marketplace-api';
import type { MarketplaceProductGroup, MarketplaceProductSummary } from '@/types/marketplace';

const subscribeNoop = () => () => {};

type StatusFilter = 'all' | 'published' | 'draft';

type CreatorCatalogueAddProductsModalProps = {
  open: boolean;
  group: MarketplaceProductGroup | null;
  products: MarketplaceProductSummary[];
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onAdd: (productIds: string[]) => void;
  onCreateProduct?: () => void;
};

export function CreatorCatalogueAddProductsModal({
  open,
  group,
  products,
  saving = false,
  error = null,
  onClose,
  onAdd,
  onCreateProduct,
}: CreatorCatalogueAddProductsModalProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [wasOpen, setWasOpen] = useState(open);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setStatus('all');
      setSelected(new Set());
    }
  }

  const available = useMemo(() => {
    const inGroup = new Set(group?.productIds ?? []);
    return products.filter((product) => !inGroup.has(product.id));
  }, [group, products]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return available
      .filter((product) => {
        if (status === 'published' && !product.isPublished) return false;
        if (status === 'draft' && product.isPublished) return false;
        if (!needle) return true;
        return [product.title, product.genre ?? '', ...(product.tags ?? [])].join(' ').toLowerCase().includes(needle);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [available, query, status]);

  const draftCount = available.filter((product) => !product.isPublished).length;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, saving]);

  if (!open || !mounted || !group) return null;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected = visible.length > 0 && visible.every((product) => selected.has(product.id));
  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visible.forEach((product) => next.delete(product.id));
      else visible.forEach((product) => next.add(product.id));
      return next;
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-start sm:px-5 sm:pt-[8vh]">
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 h-[100dvh] w-full cursor-default bg-black/40 dark:bg-black/60"
        onClick={() => !saving && onClose()}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalogue-add-title"
        className="relative z-[201] flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-black/[0.08] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:border-white/[0.1] dark:bg-[#0A0A0A] sm:max-h-[min(84dvh,720px)] sm:max-w-[560px] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-4 pt-5">
          <div className="min-w-0">
            <h2 id="catalogue-add-title" className="text-[18px] font-bold text-[#111111] dark:text-white">
              Add products
            </h2>
            <p className="mt-0.5 truncate text-[14px] text-neutral-500 dark:text-neutral-400">
              to <span className="font-medium text-[#111111] dark:text-white">{group.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/[0.06] hover:text-[#111111] disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {available.length > 0 ? (
          <div className="shrink-0 space-y-3 px-6 pb-4">
            <label className="flex items-center gap-2.5 rounded-lg border border-black/[0.12] px-3.5 py-2.5 transition-[border-color,box-shadow] focus-within:border-[#FF5722] focus-within:shadow-[0_0_0_3px_rgba(255,87,34,0.16)] dark:border-white/[0.14]">
              <svg className="h-4 w-4 shrink-0 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your products"
                aria-label="Search your products"
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111111] outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
              />
            </label>
            <div className="flex items-center justify-between gap-3">
              {draftCount > 0 && draftCount < available.length ? (
                <div className="flex gap-1.5" role="radiogroup" aria-label="Status">
                  {(['all', 'published', 'draft'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={status === value}
                      onClick={() => setStatus(value)}
                      className={`rounded-full border px-3 py-1 text-[13px] font-medium capitalize transition-colors ${
                        status === value
                          ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                          : 'border-black/[0.12] text-neutral-600 hover:border-black/25 dark:border-white/[0.14] dark:text-neutral-300 dark:hover:border-white/30'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                  {available.length} product{available.length !== 1 ? 's' : ''} not in this catalogue
                </span>
              )}
              {visible.length > 1 ? (
                <button
                  type="button"
                  onClick={toggleAllVisible}
                  className="shrink-0 text-[13px] font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
                >
                  {allVisibleSelected ? 'Clear selection' : 'Select all'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-black/[0.08] dark:border-white/[0.08]">
          {available.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-[15px] font-medium text-[#111111] dark:text-white">
                {products.length === 0 ? 'You have no products yet.' : 'Every product is already in this catalogue.'}
              </p>
              <p className="mt-1 text-[14px] text-neutral-500 dark:text-neutral-400">
                Create a new product first, then add it to “{group.name}”.
              </p>
              {onCreateProduct ? (
                <button
                  type="button"
                  onClick={onCreateProduct}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
                >
                  New product
                </button>
              ) : null}
            </div>
          ) : visible.length === 0 ? (
            <p className="px-6 py-14 text-center text-[14px] text-neutral-500 dark:text-neutral-400">
              No products match your search.
            </p>
          ) : (
            <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {visible.map((product) => {
                const isSelected = selected.has(product.id);
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => toggle(product.id)}
                      className={`flex w-full items-center gap-4 px-6 py-3 text-left transition-colors ${
                        isSelected ? 'bg-black/[0.03] dark:bg-white/[0.05]' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-black/[0.06] bg-black/[0.03] dark:border-white/[0.08] dark:bg-white/[0.04]">
                        {product.thumbnailUrl ? (
                          <ProductThumbnailMedia
                            url={product.thumbnailUrl}
                            autoPlay={false}
                            fit="cover"
                            className="h-full w-full"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-[#111111] dark:text-white">
                          {product.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              aria-hidden
                              className={`h-1.5 w-1.5 rounded-full ${product.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            />
                            {product.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <span aria-hidden>·</span>
                          <span className="tabular-nums">{formatPrice(product.priceCents, product.currency)}</span>
                          <span aria-hidden>·</span>
                          <span>{product.type === 'PHYSICAL' ? 'Material' : 'Digital'}</span>
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                            : 'border-black/25 dark:border-white/30'
                        }`}
                      >
                        {isSelected ? (
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {available.length > 0 ? (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/[0.08] px-6 py-4 dark:border-white/[0.08]">
            <p className="min-w-0 truncate text-[13px] text-neutral-500 dark:text-neutral-400" role="status">
              {error ? (
                <span className="text-[#E0431A] dark:text-[#FF7A52]">{error}</span>
              ) : selected.size ? (
                `${selected.size} selected`
              ) : (
                'Select the products to add'
              )}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg px-4 py-2.5 text-[15px] font-medium text-neutral-500 transition-colors hover:bg-black/[0.04] hover:text-[#111111] disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selected.size || saving}
                onClick={() => onAdd([...selected])}
                className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#111111]"
              >
                {saving ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                ) : null}
                {selected.size > 1 ? `Add ${selected.size} products` : 'Add product'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
