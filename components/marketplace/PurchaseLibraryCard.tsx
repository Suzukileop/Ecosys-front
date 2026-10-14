'use client';

import Link from 'next/link';
import { productTypeName } from '@/lib/marketplace-api';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { PurchaseAccessButton, canDownload, canStream } from '@/components/marketplace/PurchaseAccessButton';
import type { MarketplacePurchase } from '@/types/marketplace';
import { formatCompactDate } from '@/components/marketplace/product-relative-date';
import { useT } from '@/lib/i18n/I18nProvider';

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
  return formatCompactDate(value);
}

export function PurchaseLibraryCard({ purchase }: PurchaseLibraryCardProps) {
  const t = useT();
  const productHref = `/marketplace/products/${purchase.productId}`;
  const typeLabel = productTypeName(purchase.productType, purchase.productTypeLabel);
  const hasVideoThumb = isVideoThumbnailUrl(purchase.thumbnailUrl);
  const accessMode = canDownload(purchase.deliveryMode)
    ? 'download'
    : canStream(purchase.deliveryMode)
      ? 'stream'
      : null;

  return (
    <article className="group flex w-full flex-col overflow-hidden !rounded-none bg-[color:var(--gn-surface)]">
      <Link
        href={productHref}
        className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327]"
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
          <div className="flex h-full items-center justify-center text-[13px] text-[color:var(--gn-ink2)]">
            {t('No preview')}
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-[4px] bg-black/70 px-2 py-0.5 text-[13px] font-semibold text-white">
            {typeLabel}
          </span>
          {purchase.fileFormat && (
            <span className="rounded-[4px] bg-black/70 px-2 py-0.5 text-[13px] font-medium text-white">
              {purchase.fileFormat}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="space-y-2">
          <Link
            href={productHref}
            className="line-clamp-2 text-[16px] font-bold leading-[22px] text-[color:var(--gn-ink)] underline-offset-4 hover:underline"
            title={purchase.productTitle}
          >
            {purchase.productTitle}
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-inset)] text-[11px] font-semibold text-[color:var(--gn-ink)]">
              {creatorInitials(purchase.creatorName)}
            </div>
            <span className="truncate text-[13px] text-[color:var(--gn-ink2)]">{purchase.creatorName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
            <span>{t('Purchased {formatPurchasedAt}', { formatPurchasedAt: formatPurchasedAt(purchase.purchasedAt) })}</span>
            {purchase.maxDownloads != null && (
              <>
                <span aria-hidden>·</span>
                <span>
                  {t('{downloadCount}/{maxDownloads} downloads left', { downloadCount: purchase.downloadCount, maxDownloads: purchase.maxDownloads })}
                </span>
              </>
            )}
          </div>

          {purchase.genre && (
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-[2px] bg-[color:var(--gn-inset)] px-2 py-0.5 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
                {purchase.genre}
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-1 pt-4">
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
            className="flex h-10 items-center justify-center text-[14px] font-semibold text-[color:var(--gn-ink2)] underline-offset-4 transition-colors hover:text-[color:var(--gn-ink)] hover:underline"
          >
            {t('View product page')}
          </Link>
        </div>
      </div>
    </article>
  );
}
