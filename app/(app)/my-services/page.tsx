'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { CreatorStudioServicesTab } from '@/components/creator/studio/CreatorStudioServicesTab';
import { CreatorStudioServicesTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { SIGNED_IN_HOME } from '@/lib/routes';

function MyServicesPageInner() {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_CREATOR')) {
      router.replace(SIGNED_IN_HOME);
    }
  }, [isLoading, user, hasRole, router]);

  if (isLoading || !user) return <CreatorStudioServicesTabSkeleton withHeader />;

  if (!hasRole('ROLE_CREATOR')) return null;

  return <CreatorStudioServicesTab showPageHeader />;
}

export default function MarketplaceMyServicesPage() {
  return (
    <DashboardHomeShell fullWidth fillViewport newsTheme newsGround>
      {/* The page scrolls inside this full-width panel (the shell fills the viewport), so the wheel
          works anywhere — over the side margins too, not only over the centred column. The column is
          News / Providers' grid: the same gutters outside a 1240px max width, so its edges line up
          with the top bar's (logo left, avatar right). `news-mono` gives it their rail boxes and type. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] sm:px-8 md:px-12 lg:px-16 [&::-webkit-scrollbar]:hidden">
        <div className="news-theme news-feed news-mono mx-auto flex w-full max-w-[1240px] flex-1 flex-col">
          <Suspense fallback={<CreatorStudioServicesTabSkeleton withHeader />}>
            <MyServicesPageInner />
          </Suspense>
        </div>
      </div>
    </DashboardHomeShell>
  );
}
