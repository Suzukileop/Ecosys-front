'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { CreatorStudioProductsTab } from '@/components/creator/studio/CreatorStudioProductsTab';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function MyProductsPageInner() {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_CREATOR')) {
      router.replace('/dashboard/home');
    }
  }, [isLoading, user, hasRole, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasRole('ROLE_CREATOR')) return null;

  return <CreatorStudioProductsTab />;
}

export default function MarketplaceMyProductsPage() {
  return (
    <DashboardHomeShell fullWidth fillViewport>
      <div className="mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col overflow-hidden px-4 sm:px-6 lg:px-8 xl:px-0">
        <Suspense
          fallback={
            <div className="pt-8 sm:pt-10">
              <CreatorStudioProductsTabSkeleton />
            </div>
          }
        >
          <MyProductsPageInner />
        </Suspense>
      </div>
    </DashboardHomeShell>
  );
}
