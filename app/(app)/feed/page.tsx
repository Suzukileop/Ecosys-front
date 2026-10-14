import { Suspense } from 'react';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { HomeNewsFeed } from '@/components/home/HomeNewsFeed';

export default function DashboardHomePage() {
  return (
    <DashboardHomeShell fullWidth>
      <Suspense fallback={null}>
        <HomeNewsFeed />
      </Suspense>
    </DashboardHomeShell>
  );
}
