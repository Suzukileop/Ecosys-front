'use client';

import Link from 'next/link';
import { PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { PurchaseAccessButton, canDownload, canStream } from '@/components/marketplace/PurchaseAccessButton';
import type { MarketplacePurchase } from '@/types/marketplace';

type PurchaseLibraryCardProps = {
  purchase: MarketplacePurchase;
};

function creatorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatPurchasedAt(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PurchaseLibraryCard({ purchase }: PurchaseLibraryCardProps) {
  const productHref = `/marketplace/products/${purchase.productId}`;
  const typeLabel = PRODUCT_TYPE_LABELS[purchase.productType] ?? purchase.productType;
  const hasVideoThumb = isVideoThumbnailUrl(purchase.thumbnailUrl);
  const accessMode = canDownload(purchase.deliveryMode)
    ? 'download'
    : canStream(purchase.deliveryMode)
      ? 'stream'
      : null;

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-neutral-900/50">
      <Link
        href={productHref}
        className="relative block h-52 w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-neutral-800"
      >
        {purchase.thumbnailUrl ? (
          <ProductThumbnailMedia
            url={purchase.thumbnailUrl}
            alt=""
            fit="cover"
            autoPlay={hasVideoThumb}
            zoomOnHover
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            Preview unavailable
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-gray-900/80 px-2.5 py-1 text-xs font-semibold text-white">
            {typeLabel}
          </span>
          {purchase.fileFormat && (
            <span className="rounded-md bg-gray-900/80 px-2.5 py-1 text-xs font-medium text-white">
              {purchase.fileFormat}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">
            Owned
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-3">
          <Link
            href={productHref}
            className="line-clamp-2 text-base font-bold leading-snug text-gray-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400 xl:line-clamp-1 xl:text-lg"
            title={purchase.productTitle}
          >
            {purchase.productTitle}
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
              {creatorInitials(purchase.creatorName)}
            </div>
            <span className="truncate text-sm text-gray-700 dark:text-gray-300">{purchase.creatorName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Purchased {formatPurchasedAt(purchase.purchasedAt)}</span>
            {purchase.maxDownloads != null && (
              <>
                <span aria-hidden>·</span>
                <span>
                  {purchase.downloadCount}/{purchase.maxDownloads} downloads left
                </span>
              </>
            )}
          </div>

          {purchase.genre && (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium lowercase text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
                {purchase.genre}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2.5 border-t border-gray-200 pt-4 dark:border-neutral-700">
          {accessMode && (
            <PurchaseAccessButton
              purchaseId={purchase.id}
              deliveryMode={purchase.deliveryMode}
              mode={accessMode}
              size="card"
            />
          )}
          <Link
            href={productHref}
            className="block text-center text-xs font-medium text-gray-500 transition hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
          >
            View product page
          </Link>
        </div>
      </div>
    </article>
  );
}
