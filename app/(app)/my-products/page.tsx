'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { CreatorStudioProductsTab } from '@/components/creator/studio/CreatorStudioProductsTab';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SIGNED_IN_HOME } from '@/lib/routes';

function MyProductsPageInner() {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_CREATOR')) {
      router.replace(SIGNED_IN_HOME);
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
    <DashboardHomeShell fullWidth fillViewport newsTheme>
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-0 sm:px-6 2xl:px-0">
          <Suspense
            fallback={
              <div className="pt-8 sm:pt-10">
                <CreatorStudioProductsTabSkeleton insetOnMobile />
              </div>
            }
          >
            <MyProductsPageInner />
          </Suspense>
        </div>
      </div>
    </DashboardHomeShell>
  );
}
