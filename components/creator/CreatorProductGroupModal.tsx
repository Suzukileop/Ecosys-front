'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MarketplaceProductGroup, MarketplaceProductSummary } from '@/types/marketplace';

type CreatorProductGroupModalProps = {
  open: boolean;
  products: MarketplaceProductSummary[];
  initialGroup?: MarketplaceProductGroup | null;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: { name: string; productIds: string[] }) => void;
  onDelete?: () => void;
};

function sortByTitle(list: MarketplaceProductSummary[]) {
  return [...list].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  );
}

function ProductPickRow({
  product,
  checked,
  onToggle,
}: {
  product: MarketplaceProductSummary;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-400"
      />
      <span className="min-w-0 flex-1 truncate text-sm text-neutral-800 dark:text-neutral-100">
        {product.title}
      </span>
    </label>
  );
}

export function CreatorProductGroupModal({
  open,
  products,
  initialGroup = null,
  saving = false,
  error = null,
  onClose,
  onSubmit,
  onDelete,
}: CreatorProductGroupModalProps) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initialGroup?.name ?? '');
    setSelectedIds(initialGroup?.productIds ?? []);
    setQuery('');
  }, [open, initialGroup]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? products.filter((product) => {
          const haystack = [
            product.title,
            product.description ?? '',
            product.genre ?? '',
            product.type,
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(needle);
        })
      : products;

    return sortByTitle(list);
  }, [products, query]);

  const physicalProducts = useMemo(
    () => filteredProducts.filter((product) => product.type === 'PHYSICAL'),
    [filteredProducts]
  );

  const virtualProducts = useMemo(
    () => filteredProducts.filter((product) => product.type !== 'PHYSICAL'),
    [filteredProducts]
  );

  const toggleProduct = (productId: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  if (!open) return null;

  const isEdit = Boolean(initialGroup);
  const canSubmit = name.trim().length > 0 && !saving;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-catalogue-modal-title"
        className="relative z-10 flex max-h-[min(90vh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <h2
          id="product-catalogue-modal-title"
          className="text-lg font-bold text-neutral-900 dark:text-white"
        >
          {isEdit ? 'Edit catalogue' : 'Create catalogue'}
        </h2>

        <label className="mt-5 block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Catalogue name
          </span>
          <input
            type="text"
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Starter pack, Premium tools…"
            className="w-full rounded-xl border-0 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:ring-2 focus:ring-orange-200 dark:bg-neutral-800 dark:text-white dark:focus:ring-orange-500/30"
          />
        </label>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Products
            </span>
            <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
              {selectedIds.length} selected
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border-0 bg-neutral-100 px-3 py-2.5 dark:bg-neutral-800">
            <svg
              className="h-4 w-4 shrink-0 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-0 dark:text-white dark:placeholder:text-neutral-500"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="rounded-full p-0.5 text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-neutral-200 p-2 [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] dark:border-neutral-700 dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
            {products.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-neutral-500">No products yet.</p>
            ) : filteredProducts.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-neutral-500">No products match your search.</p>
            ) : (
              <>
                {physicalProducts.length > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 px-2 pt-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Physical
                      </p>
                      <span className="text-[11px] tabular-nums text-neutral-400">
                        {physicalProducts.length}
                      </span>
                    </div>
                    {physicalProducts.map((product) => {
                      const checked = selectedIds.includes(product.id);
                      return (
                        <ProductPickRow
                          key={product.id}
                          product={product}
                          checked={checked}
                          onToggle={() => toggleProduct(product.id, checked)}
                        />
                      );
                    })}
                  </div>
                ) : null}

                {physicalProducts.length > 0 && virtualProducts.length > 0 ? (
                  <hr className="border-neutral-200 dark:border-neutral-700" />
                ) : null}

                {virtualProducts.length > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 px-2 pt-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Virtual
                      </p>
                      <span className="text-[11px] tabular-nums text-neutral-400">
                        {virtualProducts.length}
                      </span>
                    </div>
                    {virtualProducts.map((product) => {
                      const checked = selectedIds.includes(product.id);
                      return (
                        <ProductPickRow
                          key={product.id}
                          product={product}
                          checked={checked}
                          onToggle={() => toggleProduct(product.id, checked)}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {isEdit && onDelete ? (
            <button
              type="button"
              disabled={saving}
              onClick={onDelete}
              className="text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-60 dark:text-red-400"
            >
              Delete catalogue
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => onSubmit({ name: name.trim(), productIds: selectedIds })}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? 'Saving…' : isEdit ? 'Save catalogue' : 'Create catalogue'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
