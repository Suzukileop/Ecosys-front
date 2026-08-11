'use client';

import { use } from 'react';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { CreatorProductViewContent } from '@/components/creator/CreatorProductViewContent';
import { CreatorStudioProductViewSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';

export default function CreatorProductViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardHomeShell fullWidth>
        <div className="px-4 py-8 sm:px-6">
          <CreatorStudioProductViewSkeleton />
        </div>
      </DashboardHomeShell>
    );
  }

  if (!hasRole('ROLE_CREATOR')) {
    return (
      <DashboardHomeShell>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900">
          This section is reserved for creator accounts.
        </div>
      </DashboardHomeShell>
    );
  }

  return (
    <DashboardHomeShell fullWidth>
      <div className="px-4 py-8 sm:px-6">
        <CreatorProductViewContent productId={id} />
      </div>
    </DashboardHomeShell>
  );
}
