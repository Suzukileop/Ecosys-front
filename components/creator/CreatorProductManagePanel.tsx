'use client';

import Link from 'next/link';
import { formatPrice, isFreeProduct } from '@/lib/marketplace-api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { MarketplaceProductDetail } from '@/types/marketplace';

type CreatorProductManagePanelProps = {
  product: MarketplaceProductDetail;
  publishing: boolean;
  onTogglePublish: () => void;
};

export function CreatorProductManagePanel({
  product,
  publishing,
  onTogglePublish,
}: CreatorProductManagePanelProps) {
  const hasDiscount =
    !isFreeProduct(product.priceCents) &&
    product.compareAtPriceCents != null &&
    product.compareAtPriceCents > product.priceCents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.priceCents / product.compareAtPriceCents!) * 100)
    : null;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
            product.isPublished
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${product.isPublished ? 'bg-emerald-500' : 'bg-neutral-400'}`}
            aria-hidden
          />
          {product.isPublished ? 'Published' : 'Draft'}
        </span>
        {product.isPublished && (
          <Link
            href={`/marketplace/products/${product.id}`}
            className="text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
          >
            Public page
          </Link>
        )}
      </div>

      <div>
        {hasDiscount && (
          <p className="text-sm text-neutral-400 line-through dark:text-neutral-500">
            {formatPrice(product.compareAtPriceCents!, product.currency)}
          </p>
        )}
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
          {formatPrice(product.priceCents, product.currency)}
        </p>
        {discountPercent != null && (
          <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            −{discountPercent}% vs original price
          </p>
        )}
      </div>

      <div className="grid gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <Link
          href={`/dashboard/creator/products/${product.id}/edit`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Edit product
        </Link>
        <button
          type="button"
          disabled={publishing}
          onClick={onTogglePublish}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
            product.isPublished
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
          }`}
        >
          {publishing && <LoadingSpinner size="sm" />}
          {publishing ? 'Updating…' : product.isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <dl className="space-y-2 border-t border-neutral-100 pt-4 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        <div className="flex justify-between gap-2">
          <dt>Views</dt>
          <dd className="font-semibold text-neutral-900 dark:text-white">{product.views ?? 0}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Likes</dt>
          <dd className="font-semibold text-neutral-900 dark:text-white">{product.likes ?? 0}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Sales</dt>
          <dd className="font-semibold text-neutral-900 dark:text-white">{product.salesCount ?? 0}</dd>
        </div>
      </dl>
    </div>
  );
}
