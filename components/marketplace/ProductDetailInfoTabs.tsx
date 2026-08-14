'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductReviewComposer } from '@/components/marketplace/ProductReviewComposer';
import { ProductPhysicalCompanionGallery } from '@/components/marketplace/ProductPhysicalCompanionGallery';
import { PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import { subscribeProductLikesUpdated } from '@/lib/productLikesBus';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceProductDetail } from '@/types/marketplace';

type ProductDetailInfoTabsProps = {
  product: MarketplaceProductDetail;
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
  reviewCount,
  onReviewSubmitted,
}: ProductDetailInfoTabsProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>('specs');
  const [likes, setLikes] = useState(product.likes);
  const lastUpdated = product.updatedAt ?? product.createdAt;
  const typeLabel = PRODUCT_TYPE_LABELS[product.type] ?? product.type;
  const typeSuffix = product.type === 'PHYSICAL' ? 'physical product' : 'digital product';
  const isOwner = Boolean(user?.id && user.id === product.creatorId);
  const hasPhysicalMedia = useMemo(() => {
    if (product.type !== 'PHYSICAL') return false;
    return (product.galleryImageUrls ?? []).some((url) => {
      const trimmed = url.trim();
      return trimmed.length > 0 && trimmed !== (product.thumbnailUrl?.trim() || '');
    });
  }, [product.type, product.thumbnailUrl, product.galleryImageUrls]);

  useEffect(() => {
    setLikes(product.likes);
  }, [product.id, product.likes]);

  useEffect(() => {
    if (isOwner && tab === 'reviews') {
      setTab('specs');
    }
  }, [isOwner, tab]);

  useEffect(() => {
    return subscribeProductLikesUpdated(({ productId: id, likes: count }) => {
      if (id === product.id) {
        setLikes(count);
      }
    });
  }, [product.id]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'specs', label: 'Characteristics' },
    ...(!isOwner ? [{ id: 'reviews' as const, label: `Reviews (${reviewCount})` }] : []),
  ];

  return (
    <section className="space-y-4">
      {hasPhysicalMedia ? (
        <ProductPhysicalCompanionGallery
          title={product.title}
          thumbnailUrl={product.thumbnailUrl}
          galleryImageUrls={product.galleryImageUrls}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? 'border-2 border-orange-500 bg-transparent text-gray-900 dark:text-white'
                : 'border-2 border-transparent bg-transparent text-gray-700 dark:text-gray-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 dark:bg-[#0F0F0F]">
        <div className={tab === 'specs' ? 'block' : 'hidden'}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <dl className="w-full shrink-0 lg:max-w-sm">
              <DetailRow label="Type" value={`${typeLabel} ${typeSuffix}`} />
              {product.fileFormat && <DetailRow label="Format" value={product.fileFormat} />}
              {product.language && <DetailRow label="Language" value={product.language} />}
              {product.fileSizeMb != null && (
                <DetailRow label="Size" value={`${product.fileSizeMb} MB`} />
              )}
              {product.version && <DetailRow label="Version" value={product.version} />}
            </dl>

            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <InsightCard label="Last update" value={formatProductDate(lastUpdated)} />
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

        <div className={tab === 'reviews' && !isOwner ? 'block' : 'hidden'}>
          <ProductReviewComposer productId={product.id} onSubmitted={onReviewSubmitted} />
        </div>
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3 text-sm">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="font-medium capitalize text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3.5 dark:bg-[#1F1F1F]">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
