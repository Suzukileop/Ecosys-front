import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { HomeNewsPageSkeleton } from '@/components/home/HomeNewsSkeleton';

export default function DashboardHomeLoading() {
  return (
    <DashboardHomeShell fullWidth>
      <HomeNewsPageSkeleton />
    </DashboardHomeShell>
  );
}
