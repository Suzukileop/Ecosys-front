'use client';

import { useState } from 'react';
import { ProductViewTracker } from '@/components/marketplace/ProductViewTracker';

type ProductViewsDisplayProps = {
  productId: string;
  initialViews: number;
};

export function ProductViewsDisplay({ productId, initialViews }: ProductViewsDisplayProps) {
  const [views, setViews] = useState(initialViews);

  return (
    <>
      <ProductViewTracker productId={productId} onRecorded={() => setViews((count) => count + 1)} />
      <span>{views} views</span>
    </>
  );
}
