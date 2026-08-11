import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { HomeNewsPageSkeleton } from '@/components/home/HomeNewsSkeleton';

export default function DashboardHomeLoading() {
  return (
    <DashboardHomeShell fullWidth>
      <div className="w-full px-3 sm:px-4 lg:px-5">
        <HomeNewsPageSkeleton />
      </div>
    </DashboardHomeShell>
  );
}
