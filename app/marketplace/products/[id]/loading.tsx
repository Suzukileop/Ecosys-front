import { ProductDetailSkeleton } from '@/components/marketplace/ProductDetailSkeleton';

export default function ProductDetailLoading() {
  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <ProductDetailSkeleton />
    </div>
  );
}
