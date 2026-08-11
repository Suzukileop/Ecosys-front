import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { HomeNewsFeed } from '@/components/home/HomeNewsFeed';

export default function DashboardHomePage() {
  return (
    <DashboardHomeShell fullWidth>
      {/* Symmetric horizontal inset — same left margin as right */}
      <div className="w-full px-3 sm:px-4 lg:px-5">
        <HomeNewsFeed />
      </div>
    </DashboardHomeShell>
  );
}
