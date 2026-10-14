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
    <DashboardHomeShell fullWidth fillViewport newsTheme newsGround>
      {/* News / Products' frame: the same gutters outside a 1240px column, so its edges line up with
          the top bar's (logo left, avatar right); `news-mono` gives it the rail boxes and type. */}
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] sm:px-8 md:px-12 lg:px-16 [&::-webkit-scrollbar]:hidden">
        <div className="news-theme news-feed news-mono mx-auto flex w-full max-w-[1240px] flex-1 flex-col">
          <Suspense
            fallback={<CreatorStudioProductsTabSkeleton insetOnMobile />}
          >
            <MyProductsPageInner />
          </Suspense>
        </div>
      </div>
    </DashboardHomeShell>
  );
}
