import { MarketplaceHubSkeleton } from '@/components/marketplace/MarketplaceSkeleton';

export default function MarketplaceHubLoading() {
  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <MarketplaceHubSkeleton />
    </div>
  );
}
