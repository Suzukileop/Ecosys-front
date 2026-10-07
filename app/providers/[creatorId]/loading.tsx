import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { PublicCreatorProfileSkeleton } from '@/components/marketplace/PublicCreatorProfileSkeleton';

export default function MarketplaceCreatorLoading() {
  return (
    <DashboardHomeShell fullWidth>
      <PublicCreatorProfileSkeleton />
    </DashboardHomeShell>
  );
}
