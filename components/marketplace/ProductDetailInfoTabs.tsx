'use client';

import { localeTag } from '@/lib/i18n/active';
import type { ReactNode } from 'react';
import { productTypeName } from '@/lib/marketplace-api';
import { getStockStatus, LOW_STOCK_THRESHOLD } from '@/lib/product-stock';
import type { DeliveryMode, MarketplaceProductDetail } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

type ProductDetailCharacteristicsProps = {
  product: MarketplaceProductDetail;
  reviewCount: number;
};

type Row = { label: string; value: ReactNode };

const DELIVERY_LABELS: Record<DeliveryMode, string> = {
  STREAM_ONLY: 'Streaming only',
  DOWNLOAD: 'Download',
  BOTH: 'Streaming & download',
};

function formatProductDate(value: string): string {
  return new Date(value).toLocaleDateString(localeTag(), { year: 'numeric', month: 'short', day: 'numeric' });
}

function countPhotos(product: MarketplaceProductDetail): number {
  const urls = new Set<string>();
  for (const raw of [product.thumbnailUrl, ...(product.galleryImageUrls ?? [])]) {
    const url = raw?.trim();
    if (url) urls.add(url);
  }
  return urls.size;
}

export function ProductDetailCharacteristics({ product, reviewCount }: ProductDetailCharacteristicsProps) {
  const t = useT();
  const isPhysical = product.type === 'PHYSICAL';
  const lastUpdated = product.updatedAt ?? product.createdAt;
  const reviewsLabel = reviewCount === 1 ? t('1 review') : `${reviewCount.toLocaleString()} reviews`;

  const rows: Row[] = [];
  if (isPhysical) {
    const stock = getStockStatus(product);
    const photos = countPhotos(product);
    const lowStock = stock.quantity != null && stock.quantity > 1 && stock.quantity <= LOW_STOCK_THRESHOLD;
    const tone = stock.tone === 'out' ? 'out' : lowStock ? 'low' : 'ok';
    rows.push(
      { label: t('Type'), value: 'Physical product' },
      {
        label: t('Availability'),
        value: (
          <span className="inline-flex items-center gap-2">
            {tone === 'ok' ? null : (
              <span
                className={`h-2 w-2 rounded-full ${tone === 'out' ? 'bg-[#F4212E]' : 'bg-[color:var(--gn-ink)]'}`}
                aria-hidden
              />
            )}
            {stock.tone === 'out' ? t('Out of stock') : lowStock ? t('Only {count} left', { count: stock.quantity }) : t('In stock')}
          </span>
        ),
      },
      { label: t('Photos'), value: photos === 1 ? '1 photo' : `${photos} photos` }
    );
  } else {
    rows.push({ label: t('Type'), value: productTypeName(product.type, product.typeLabel) });
    if (product.deliveryMode) {
      rows.push({ label: t('Delivery'), value: DELIVERY_LABELS[product.deliveryMode] ?? product.deliveryMode });
    }
    if (product.fileFormat) rows.push({ label: t('Format'), value: product.fileFormat });
    if (product.fileSizeMb != null) rows.push({ label: t('File size'), value: `${product.fileSizeMb} MB` });
    if (product.language) rows.push({ label: t('Language'), value: product.language });
    if (product.version) rows.push({ label: t('Version'), value: product.version });
  }

  // Zero counts are hidden (News rule). Views and likes sit under the title already; the dates and
  // the counts that matter to a buyer (sold, reviews) are facts like the others.
  const sold = product.salesCount ?? 0;
  if (sold > 0) rows.push({ label: t('Sold'), value: sold.toLocaleString() });
  if (reviewCount > 0) rows.push({ label: t('Reviews'), value: reviewsLabel });
  rows.push({ label: t('Listed on'), value: formatProductDate(product.createdAt) });
  if (lastUpdated !== product.createdAt) rows.push({ label: t('Last update'), value: formatProductDate(lastUpdated) });

  return (
    <section>
      <h2 className="px-4 text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)] sm:px-0">
        {t('Details')}
      </h2>
      {/* One block on the card tone: label left, value right, a hairline between rows — two columns
          of rows from sm, so the list reads at a glance instead of tiles that wrap. */}
      <dl className="mt-3 grid bg-[color:var(--gn-surface)] px-5 sm:mt-4 sm:grid-cols-2 sm:gap-x-10 sm:px-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-3.5 text-[15px] leading-5 shadow-[inset_0_-1px_0_var(--gn-line)] last:shadow-none sm:[&:nth-last-child(2):nth-child(odd)]:shadow-none"
          >
            <dt className="text-[color:var(--gn-ink2)]">{t(row.label)}</dt>
            <dd className="text-right font-semibold text-[color:var(--gn-ink)] tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
