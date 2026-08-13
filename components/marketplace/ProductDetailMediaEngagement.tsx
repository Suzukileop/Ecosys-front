'use client';

import { useEffect, useState } from 'react';
import { ProductCardEngagementStrip } from '@/components/marketplace/ProductCardEngagementStrip';
import { ProductViewTracker } from '@/components/marketplace/ProductViewTracker';
import { subscribeProductLikesUpdated } from '@/lib/productLikesBus';

type ProductDetailMediaEngagementProps = {
  productId: string;
  initialViews: number;
  initialLikes: number;
};

export function ProductDetailMediaEngagement({
  productId,
  initialViews,
  initialLikes,
}: ProductDetailMediaEngagementProps) {
  const [views, setViews] = useState(initialViews);
  const [likes, setLikes] = useState(initialLikes);

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes, productId]);

  useEffect(() => {
    return subscribeProductLikesUpdated(({ productId: id, likes: count }) => {
      if (id === productId) {
        setLikes(count);
      }
    });
  }, [productId]);

  return (
    <div className="shrink-0">
      <ProductViewTracker productId={productId} onRecorded={() => setViews((count) => count + 1)} />
      <ProductCardEngagementStrip
        productId={productId}
        initialLikes={likes}
        views={views}
        showLikeButton={false}
      />
    </div>
  );
}
