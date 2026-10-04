'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice, isFreeProduct } from '@/lib/marketplace-api';
import {
  creatorProductEditPath,
  type CreatorProductNavFrom,
} from '@/lib/creator-product-nav';
import { getStockStatus } from '@/lib/product-stock';
import { InfoHint } from '@/components/ui/InfoHint';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { MarketplaceProductDetail } from '@/types/marketplace';

type CreatorProductManagePanelProps = {
  product: MarketplaceProductDetail;
  publishing: boolean;
  onTogglePublish: () => void;
  recordingSale?: boolean;
  /** Brief cooldown after a sale so an accidental double click can't log it twice. */
  saleLocked?: boolean;
  onRecordSale?: (quantity: number) => void;
  onRemoveSale?: () => void;
  /** Keeps edit → back navigation in the same section (Profile vs My Product). */
  from?: CreatorProductNavFrom;
};

const LABEL = 'text-[13px] font-medium text-neutral-500 dark:text-neutral-400';
const DIVIDER = 'border-t border-black/[0.06] dark:border-white/[0.08]';
const DIGITAL_MAX_SALE_BATCH = 99;
const STEPPER_BUTTON =
  'h-full w-10 text-lg text-[#111111] transition hover:bg-black/[0.04] disabled:opacity-30 dark:text-white dark:hover:bg-white/[0.06]';

export function CreatorProductManagePanel({
  product,
  publishing,
  onTogglePublish,
  recordingSale = false,
  saleLocked = false,
  onRecordSale,
  onRemoveSale,
  from = 'products',
}: CreatorProductManagePanelProps) {
  const [saleQuantity, setSaleQuantity] = useState(1);
  const isPhysical = product.type === 'PHYSICAL';
  const free = isFreeProduct(product.priceCents);
  const hasDiscount =
    !free && product.compareAtPriceCents != null && product.compareAtPriceCents > product.priceCents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.priceCents / product.compareAtPriceCents!) * 100)
    : null;
  const stock = getStockStatus(product);
  const sales = product.salesCount ?? 0;
  const maxSale = isPhysical ? (stock.quantity ?? 0) : DIGITAL_MAX_SALE_BATCH;
  const canRecordSale = Boolean(onRecordSale) && maxSale > 0;
  const canRemoveSale = Boolean(onRemoveSale) && sales > 0;
  const quantityToRecord = Math.min(Math.max(saleQuantity, 1), Math.max(maxSale, 1));
  const saleDisabled = recordingSale || saleLocked;
  const submitSale = () => {
    if (saleDisabled) return;
    onRecordSale?.(quantityToRecord);
    setSaleQuantity(1);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#111111]">
      <div className="flex items-center justify-between gap-2 px-6 pt-6">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          <span
            className={`h-2 w-2 rounded-full ${product.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}
            aria-hidden
          />
          {product.isPublished ? 'Live on marketplace' : 'Draft'}
        </span>
        {product.isPublished && (
          <Link
            href={`/marketplace/products/${product.id}`}
            className="group inline-flex items-center gap-1 text-sm font-medium text-[#111111] underline-offset-4 hover:underline dark:text-white"
          >
            View
            <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px">
              ↗
            </span>
          </Link>
        )}
      </div>

      <div className="px-6 pb-6 pt-5">
        <p className={LABEL}>{isPhysical ? 'Selling price' : 'Price'}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <p className="text-[34px] font-semibold leading-none tracking-[-0.03em] text-[#111111] tabular-nums dark:text-white">
            {formatPrice(product.priceCents, product.currency)}
          </p>
          {hasDiscount && (
            <p className="text-[15px] text-neutral-400 line-through tabular-nums dark:text-neutral-500">
              {formatPrice(product.compareAtPriceCents!, product.currency)}
            </p>
          )}
        </div>
        {discountPercent != null && (
          <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {discountPercent}% off the original price
          </p>
        )}
      </div>

      {!isPhysical && (
        <div className={`${DIVIDER} flex items-center justify-between gap-3 px-6 py-4`}>
          <p className={LABEL}>Availability</p>
          <span className="text-[15px] font-medium text-[#111111] dark:text-white">Unlimited · Instant delivery</span>
        </div>
      )}

      {(canRecordSale || canRemoveSale) && (
        <div className={`${DIVIDER} space-y-3 px-6 py-5`}>
          {canRecordSale && (
            <div className="flex items-center gap-2.5">
              {maxSale > 1 && (
                <div className="inline-flex h-12 shrink-0 items-center rounded-lg border border-black/[0.1] dark:border-white/[0.14]">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={saleDisabled || quantityToRecord <= 1}
                    onClick={() => setSaleQuantity(quantityToRecord - 1)}
                    className={STEPPER_BUTTON}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-[15px] font-semibold text-[#111111] tabular-nums dark:text-white">
                    {quantityToRecord}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={saleDisabled || quantityToRecord >= maxSale}
                    onClick={() => setSaleQuantity(quantityToRecord + 1)}
                    className={STEPPER_BUTTON}
                  >
                    +
                  </button>
                </div>
              )}
              <button
                type="button"
                disabled={saleDisabled}
                onClick={submitSale}
                className={`relative inline-flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg px-4 text-[15px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111111] ${
                  saleLocked && !recordingSale
                    ? 'cursor-default bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'bg-[#FF5722] text-white hover:bg-[#F4511E] disabled:opacity-60'
                }`}
              >
                {recordingSale && <LoadingSpinner size="sm" />}
                {recordingSale
                  ? 'Saving…'
                  : saleLocked
                    ? '✓ Sale recorded'
                    : maxSale === 1
                      ? 'Mark as sold'
                      : `Record ${quantityToRecord === 1 ? 'sale' : `${quantityToRecord} sales`}`}
                {saleLocked && !recordingSale && (
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[#FF5722]"
                  />
                )}
              </button>
              <InfoHint align="end">
                {isPhysical
                  ? 'Closed a deal in Discussions? Log it — stock and sales update instantly.'
                  : 'Sold a copy outside the marketplace? Log it — sales and revenue update instantly.'}{' '}
                Made a mistake? Use “Remove a sale” below.
              </InfoHint>
            </div>
          )}
          {canRemoveSale && (
            <button
              type="button"
              disabled={recordingSale}
              onClick={onRemoveSale}
              className="text-sm font-medium text-neutral-500 underline-offset-4 transition hover:text-[#111111] hover:underline disabled:opacity-50 dark:text-neutral-400 dark:hover:text-white"
            >
              Remove a sale
            </button>
          )}
        </div>
      )}

      <div className={`${DIVIDER} grid gap-2.5 p-6`}>
        <Link
          href={creatorProductEditPath(product.id, from)}
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#111111] px-4 text-[15px] font-medium text-white transition hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] focus-visible:ring-offset-2 dark:bg-white dark:text-[#111111] dark:hover:bg-neutral-200 dark:focus-visible:ring-offset-[#111111]"
        >
          {isPhysical && stock.tone === 'out' ? 'Restock product' : 'Edit product'}
        </Link>
        <button
          type="button"
          disabled={publishing}
          onClick={onTogglePublish}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-black/[0.1] px-4 text-[15px] font-medium text-[#111111] transition hover:border-black/[0.25] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] disabled:opacity-60 dark:border-white/[0.14] dark:text-white dark:hover:border-white/[0.3]"
        >
          {publishing && <LoadingSpinner size="sm" />}
          {publishing ? 'Updating…' : product.isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <dl className={`${DIVIDER} grid grid-cols-3 divide-x divide-black/[0.06] dark:divide-white/[0.08]`}>
        {[
          { label: 'Views', value: product.views ?? 0 },
          { label: 'Likes', value: product.likes ?? 0 },
          { label: 'Sales', value: sales },
        ].map((item) => (
          <div key={item.label} className="px-4 py-4 text-center">
            <dt className="text-[13px] text-neutral-500 dark:text-neutral-400">{item.label}</dt>
            <dd className="mt-0.5 text-lg font-semibold text-[#111111] tabular-nums dark:text-white">
              {item.value.toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
