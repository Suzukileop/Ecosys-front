'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { formatPrice } from '@/lib/marketplace-api';
import type { MarketplaceProductGroup, MarketplaceProductSummary } from '@/types/marketplace';

const subscribeNoop = () => () => {};
const NAME_MAX = 120;

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

type FormatFilter = 'all' | 'physical' | 'virtual';

function Checkbox({ checked, indeterminate = false }: { checked: boolean; indeterminate?: boolean }) {
  const on = checked || indeterminate;
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
        on
          ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
          : 'border-black/25 dark:border-white/30'
      }`}
    >
      {checked ? (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      ) : indeterminate ? (
        <span className="h-0.5 w-2.5 rounded-full bg-current" />
      ) : null}
    </span>
  );
}

function ProductRow({
  product,
  checked,
  onToggle,
}: {
  product: MarketplaceProductSummary;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex w-full items-center gap-4 px-6 py-3 text-left transition-colors ${
        checked ? 'bg-black/[0.03] dark:bg-white/[0.05]' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
      }`}
    >
      <Checkbox checked={checked} />
      <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md border border-black/[0.06] bg-black/[0.03] dark:border-white/[0.08] dark:bg-white/[0.04]">
        {product.thumbnailUrl ? (
          <ProductThumbnailMedia url={product.thumbnailUrl} autoPlay={false} fit="cover" className="h-full w-full" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-[#111111] dark:text-white">{product.title}</span>
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
        </span>
      </span>
    </button>
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
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState<FormatFilter>('all');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const currentKey = open ? (initialGroup?.id ?? 'new') : null;
  if (openKey !== currentKey) {
    setOpenKey(currentKey);
    if (currentKey) {
      const liveIds = new Set(products.map((product) => product.id));
      setName(initialGroup?.name ?? '');
      setSelectedIds((initialGroup?.productIds ?? []).filter((id) => liveIds.has(id)));
      setQuery('');
      setFormat('all');
      setConfirmDelete(false);
      setNameTouched(false);
    }
  }

  const physicalCount = products.filter((product) => product.type === 'PHYSICAL').length;
  const virtualCount = products.length - physicalCount;
  const showFormatFilter = physicalCount > 0 && virtualCount > 0;

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products
      .filter((product) => {
        if (format === 'physical' && product.type !== 'PHYSICAL') return false;
        if (format === 'virtual' && product.type === 'PHYSICAL') return false;
        if (!needle) return true;
        return [product.title, product.genre ?? '', ...(product.tags ?? [])].join(' ').toLowerCase().includes(needle);
      })
      .sort((a, b) => {
        const aSel = selectedIds.includes(a.id) ? 0 : 1;
        const bSel = selectedIds.includes(b.id) ? 0 : 1;
        return aSel - bSel || a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      });
    // Order is fixed when the dialog opens or the filters change, not on every tick of a checkbox.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, query, format, openKey]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => nameRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose, saving]);

  if (!open || !mounted) return null;

  const isEdit = Boolean(initialGroup);
  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !saving;
  const nameError = nameTouched && !trimmedName ? 'Give your catalogue a name.' : null;

  const selectedSet = new Set(selectedIds);
  const visibleSelectedCount = visibleProducts.filter((product) => selectedSet.has(product.id)).length;
  const allVisibleSelected = visibleProducts.length > 0 && visibleSelectedCount === visibleProducts.length;

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAllVisible = () => {
    const ids = visibleProducts.map((product) => product.id);
    setSelectedIds((prev) =>
      allVisibleSelected ? prev.filter((id) => !ids.includes(id)) : [...prev, ...ids.filter((id) => !prev.includes(id))]
    );
  };

  const submit = () => {
    setNameTouched(true);
    if (!canSubmit) {
      if (!trimmedName) nameRef.current?.focus();
      return;
    }
    onSubmit({ name: trimmedName, productIds: selectedIds });
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
        aria-labelledby="product-catalogue-modal-title"
        className="relative z-[201] flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-black/[0.08] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:border-white/[0.1] dark:bg-[#0A0A0A] sm:max-h-[min(86dvh,760px)] sm:max-w-[580px] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-2 pt-5">
          <div>
            <h2 id="product-catalogue-modal-title" className="text-[18px] font-bold text-[#111111] dark:text-white">
              {isEdit ? 'Edit catalogue' : 'New catalogue'}
            </h2>
            <p className="mt-0.5 text-[14px] text-neutral-500 dark:text-neutral-400">
              Group products into a collection buyers can browse on your shop.
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

        <div className="shrink-0 space-y-5 px-6 pb-4 pt-4">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="catalogue-name" className="text-[14px] font-medium text-[#111111] dark:text-white">
                Name
              </label>
              <span className="text-[12px] tabular-nums text-neutral-400 dark:text-neutral-500">
                {name.length}/{NAME_MAX}
              </span>
            </div>
            <input
              ref={nameRef}
              id="catalogue-name"
              type="text"
              value={name}
              maxLength={NAME_MAX}
              autoComplete="off"
              aria-invalid={Boolean(nameError)}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="e.g. Summer collection, Starter pack"
              className={`mt-2 block w-full rounded-lg border bg-transparent px-3.5 py-2.5 text-[15px] text-[#111111] outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-[#FF5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.16)] dark:text-white dark:placeholder:text-neutral-500 ${
                nameError ? 'border-[#FF5722]/70' : 'border-black/[0.12] hover:border-black/25 dark:border-white/[0.14] dark:hover:border-white/25'
              }`}
            />
            {nameError ? <p className="mt-2 text-[13px] text-[#E0431A] dark:text-[#FF7A52]">{nameError}</p> : null}
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[14px] font-medium text-[#111111] dark:text-white">
                Products
                <span className="ml-1.5 font-normal text-neutral-400 dark:text-neutral-500">Optional</span>
              </p>
              {products.length > 0 ? (
                <span className="text-[13px] tabular-nums text-neutral-500 dark:text-neutral-400">
                  {selectedIds.length} of {products.length} selected
                </span>
              ) : null}
            </div>
            {products.length > 0 ? (
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-black/[0.12] px-3.5 py-2.5 transition-[border-color,box-shadow] focus-within:border-[#FF5722] focus-within:shadow-[0_0_0_3px_rgba(255,87,34,0.16)] dark:border-white/[0.14]">
                  <svg className="h-4 w-4 shrink-0 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
                  </svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products"
                    aria-label="Search products"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111111] outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
                  />
                </label>
                {showFormatFilter ? (
                  <div className="flex shrink-0 gap-1.5" role="radiogroup" aria-label="Format">
                    {(
                      [
                        ['all', 'All', products.length],
                        ['physical', 'Material', physicalCount],
                        ['virtual', 'Digital', virtualCount],
                      ] as const
                    ).map(([value, label, count]) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={format === value}
                        onClick={() => setFormat(value)}
                        className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          format === value
                            ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                            : 'border-black/[0.12] text-neutral-600 hover:border-black/25 dark:border-white/[0.14] dark:text-neutral-300 dark:hover:border-white/30'
                        }`}
                      >
                        {label}
                        <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-black/[0.08] dark:border-white/[0.08]">
          {products.length === 0 ? (
            <p className="px-6 py-12 text-center text-[14px] text-neutral-500 dark:text-neutral-400">
              You have no products yet. You can create the catalogue now and add products later.
            </p>
          ) : visibleProducts.length === 0 ? (
            <p className="px-6 py-12 text-center text-[14px] text-neutral-500 dark:text-neutral-400">
              No products match your search.
            </p>
          ) : (
            <>
              <button
                type="button"
                role="checkbox"
                aria-checked={allVisibleSelected ? true : visibleSelectedCount > 0 ? 'mixed' : false}
                onClick={toggleAllVisible}
                className="sticky top-0 z-[1] flex w-full items-center gap-4 border-b border-black/[0.06] bg-white/95 px-6 py-2.5 text-left backdrop-blur-sm dark:border-white/[0.06] dark:bg-[#0A0A0A]/95"
              >
                <Checkbox checked={allVisibleSelected} indeterminate={!allVisibleSelected && visibleSelectedCount > 0} />
                <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
                  {allVisibleSelected ? 'Deselect all' : 'Select all'}
                  {query || format !== 'all' ? ` (${visibleProducts.length})` : ''}
                </span>
              </button>
              <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {visibleProducts.map((product) => (
                  <li key={product.id}>
                    <ProductRow
                      product={product}
                      checked={selectedSet.has(product.id)}
                      onToggle={() => toggleProduct(product.id)}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="shrink-0 border-t border-black/[0.08] px-6 py-4 dark:border-white/[0.08]">
          {error ? (
            <p className="mb-3 text-[13px] text-[#E0431A] dark:text-[#FF7A52]" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            {isEdit && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-neutral-500 dark:text-neutral-400">Delete it?</span>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={onDelete}
                    className="rounded-md px-2 py-1 font-semibold text-[#E0431A] transition-colors hover:bg-[#FF5722]/10 disabled:opacity-50 dark:text-[#FF7A52]"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-md px-2 py-1 font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
                  >
                    Keep
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setConfirmDelete(true)}
                  className="text-[14px] font-medium text-neutral-500 transition-colors hover:text-[#E0431A] disabled:opacity-50 dark:text-neutral-400 dark:hover:text-[#FF7A52]"
                >
                  Delete catalogue
                </button>
              )
            ) : (
              <span />
            )}
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
                disabled={saving}
                onClick={submit}
                className={`inline-flex items-center gap-2 rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#111111] ${
                  trimmedName ? '' : 'opacity-40'
                }`}
              >
                {saving ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                ) : null}
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create catalogue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
