'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import { subscribeProductLikesUpdated } from '@/lib/productLikesBus';
import { getStockStatus, LOW_STOCK_THRESHOLD, STOCK_TONE_DOT } from '@/lib/product-stock';
import type { DeliveryMode, MarketplaceProductDetail } from '@/types/marketplace';

type ProductDetailCharacteristicsProps = {
  product: MarketplaceProductDetail;
  reviewCount: number;
};

type Row = { label: string; value: ReactNode };
type Tile = { label: string; value: string };

const DELIVERY_LABELS: Record<DeliveryMode, string> = {
  STREAM_ONLY: 'Streaming only',
  DOWNLOAD: 'Download',
  BOTH: 'Streaming & download',
};

function formatProductDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
  const [likes, setLikes] = useState(product.likes);

  useEffect(
    () =>
      subscribeProductLikesUpdated(({ productId: id, likes: count }) => {
        if (id === product.id) setLikes(count);
      }),
    [product.id]
  );

  const isPhysical = product.type === 'PHYSICAL';
  const lastUpdated = product.updatedAt ?? product.createdAt;
  const reviewsLabel = reviewCount === 1 ? '1 review' : `${reviewCount.toLocaleString()} reviews`;

  const rows: Row[] = [];
  if (isPhysical) {
    const stock = getStockStatus(product);
    const photos = countPhotos(product);
    const lowStock = stock.quantity != null && stock.quantity > 1 && stock.quantity <= LOW_STOCK_THRESHOLD;
    const tone = stock.tone === 'out' ? 'out' : lowStock ? 'low' : 'ok';
    rows.push(
      { label: 'Type', value: 'Physical product' },
      {
        label: 'Availability',
        value: (
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STOCK_TONE_DOT[tone]}`} aria-hidden />
            {stock.tone === 'out' ? 'Out of stock' : lowStock ? `Only ${stock.quantity} left` : 'In stock'}
          </span>
        ),
      },
      { label: 'Photos', value: photos === 1 ? '1 photo' : `${photos} photos` }
    );
  } else {
    rows.push({ label: 'Type', value: PRODUCT_TYPE_LABELS[product.type] ?? product.type });
    if (product.deliveryMode) {
      rows.push({ label: 'Delivery', value: DELIVERY_LABELS[product.deliveryMode] ?? product.deliveryMode });
    }
    if (product.fileFormat) rows.push({ label: 'Format', value: product.fileFormat });
    if (product.fileSizeMb != null) rows.push({ label: 'File size', value: `${product.fileSizeMb} MB` });
    if (product.language) rows.push({ label: 'Language', value: product.language });
    if (product.version) rows.push({ label: 'Version', value: product.version });
  }

  const tiles: Tile[] = [
    { label: 'Customer reviews', value: reviewsLabel },
    { label: 'Views', value: product.views.toLocaleString() },
    { label: 'Likes', value: likes.toLocaleString() },
    { label: 'Listed on', value: formatProductDate(product.createdAt) },
    { label: 'Last update', value: formatProductDate(lastUpdated) },
    ...((product.salesCount ?? 0) > 0 ? [{ label: 'Sold', value: (product.salesCount ?? 0).toLocaleString() }] : []),
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#111111] dark:text-white">Characteristics</h2>
      <div className="mt-5 overflow-hidden rounded-lg border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#111111]">
        <div className="flex flex-col lg:flex-row">
          <dl className="w-full shrink-0 divide-y divide-black/[0.06] px-6 py-1 dark:divide-white/[0.08] lg:max-w-sm lg:border-r lg:border-black/[0.06] lg:dark:border-white/[0.08]">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-4 text-[15px]">
                <dt className="text-neutral-500 dark:text-neutral-400">{row.label}</dt>
                <dd className="text-right font-medium text-[#111111] tabular-nums dark:text-white">{row.value}</dd>
              </div>
            ))}
          </dl>

          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-px border-t border-black/[0.06] bg-black/[0.06] dark:border-white/[0.08] dark:bg-white/[0.08] sm:grid-cols-3 lg:border-t-0">
            {tiles.map((tile) => (
              <div key={tile.label} className="bg-white px-6 py-5 dark:bg-[#111111]">
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">{tile.label}</dt>
                <dd className="mt-2 text-xl font-semibold tracking-[-0.01em] text-[#111111] tabular-nums dark:text-white">
                  {tile.value}
                </dd>
              </div>
            ))}
            {Array.from({ length: (6 - (tiles.length % 6)) % 6 }, (_, index) => (
              <div key={`filler-${index}`} aria-hidden className="bg-white dark:bg-[#111111]" />
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
