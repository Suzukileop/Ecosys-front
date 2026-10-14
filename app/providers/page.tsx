import { Suspense } from 'react';
import { ServiceProviderCatalogGate } from '@/components/marketplace/ServiceProviderCatalogGate';
import { ProvidersCatalogSkeleton } from '@/components/marketplace/ProvidersCatalogSkeleton';

export default function MarketplaceCreatorsPage() {
  return (
    <Suspense fallback={<ProvidersCatalogSkeleton />}>
      <ServiceProviderCatalogGate />
    </Suspense>
  );
}
