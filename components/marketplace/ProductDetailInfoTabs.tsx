'use client';

import { useEffect, useState } from 'react';
import { ProductReviewComposer } from '@/components/marketplace/ProductReviewComposer';
import { PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import { subscribeProductLikesUpdated } from '@/lib/productLikesBus';
import type { MarketplaceProductDetail } from '@/types/marketplace';

type ProductDetailInfoTabsProps = {
  product: MarketplaceProductDetail;
  deliveryLabel: string;
  licenseLabel: string;
  reviewCount: number;
  onReviewSubmitted?: () => void;
};

type TabId = 'specs' | 'reviews';

function formatProductDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ProductDetailInfoTabs({
  product,
  deliveryLabel,
  licenseLabel,
  reviewCount,
  onReviewSubmitted,
}: ProductDetailInfoTabsProps) {
  const [tab, setTab] = useState<TabId>('specs');
  const [likes, setLikes] = useState(product.likes);
  const salesCount = product.salesCount ?? 0;
  const lastUpdated = product.updatedAt ?? product.createdAt;

  useEffect(() => {
    setLikes(product.likes);
  }, [product.id, product.likes]);

  useEffect(() => {
    return subscribeProductLikesUpdated(({ productId: id, likes: count }) => {
      if (id === product.id) {
        setLikes(count);
      }
    });
  }, [product.id]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'specs', label: 'Characteristics' },
    { id: 'reviews', label: `Reviews (${reviewCount})` },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? 'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-100'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300 dark:hover:border-neutral-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <div className={tab === 'specs' ? 'block' : 'hidden'}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <dl className="w-full shrink-0 lg:max-w-sm">
              <DetailRow
                label="Type"
                value={`${PRODUCT_TYPE_LABELS[product.type] ?? product.type} digital product`}
              />
              {product.fileFormat && <DetailRow label="Format" value={product.fileFormat} />}
              <DetailRow label="License" value={licenseLabel} />
              <DetailRow label="Delivery" value={deliveryLabel} />
              {product.language && <DetailRow label="Language" value={product.language} />}
              {product.fileSizeMb != null && (
                <DetailRow label="Size" value={`${product.fileSizeMb} MB`} />
              )}
              {product.version && <DetailRow label="Version" value={product.version} />}
            </dl>

            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <InsightCard label="Last update" value={formatProductDate(lastUpdated)} />
              <InsightCard
                label="Copies sold"
                value={salesCount === 1 ? '1 copy' : `${salesCount.toLocaleString()} copies`}
              />
              <InsightCard label="Listed on" value={formatProductDate(product.createdAt)} />
              <InsightCard
                label="Customer reviews"
                value={reviewCount === 1 ? '1 review' : `${reviewCount.toLocaleString()} reviews`}
              />
              <InsightCard label="Views" value={product.views.toLocaleString()} />
              <InsightCard label="Likes" value={likes.toLocaleString()} />
            </div>
          </div>
        </div>

        <div className={tab === 'reviews' ? 'block' : 'hidden'}>
          <ProductReviewComposer productId={product.id} onSubmitted={onReviewSubmitted} />
        </div>
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 border-b border-gray-100 py-3 text-sm last:border-b-0 dark:border-neutral-800">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="font-medium capitalize text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 dark:border-neutral-800 dark:bg-neutral-800/50">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
