'use client';

import { MyPortfolioWorkspace } from '@/components/portfolio/MyPortfolioWorkspace';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';

export default function MyPortfolioPage() {
  return (
    <DashboardHomeShell fullWidth>
      <div className="w-full max-w-none">
        <MyPortfolioWorkspace />
      </div>
    </DashboardHomeShell>
  );
}
