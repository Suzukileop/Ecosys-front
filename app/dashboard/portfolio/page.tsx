'use client';

import { MyPortfolioWorkspace } from '@/components/portfolio/MyPortfolioWorkspace';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';

export default function MyPortfolioPage() {
  return (
    <DashboardHomeShell fullWidth>
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-10 pt-1 sm:px-6">
        <MyPortfolioWorkspace />
      </div>
    </DashboardHomeShell>
  );
}
