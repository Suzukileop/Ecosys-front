import { Suspense } from 'react';
import { CreatorsCatalog } from '@/components/marketplace/CreatorsCatalog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function MarketplaceCreatorsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center px-4 py-20">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <CreatorsCatalog />
    </Suspense>
  );
}
