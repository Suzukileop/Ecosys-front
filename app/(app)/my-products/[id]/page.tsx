'use client';

import { use } from 'react';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { CreatorProductViewContent } from '@/components/creator/CreatorProductViewContent';
import { CreatorStudioProductViewSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/lib/i18n/I18nProvider';

export default function CreatorProductViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useT();
  const { id } = use(params);
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardHomeShell fullWidth newsTheme newsGround>
        <div className="w-full pb-8 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3">
          <div className="news-theme news-feed news-mono mx-auto w-full max-w-[1240px]">
            <CreatorStudioProductViewSkeleton />
          </div>
        </div>
      </DashboardHomeShell>
    );
  }

  if (!hasRole('ROLE_CREATOR')) {
    return (
      <DashboardHomeShell newsTheme newsGround>
        <div className="bg-[color:var(--gn-surface)] px-6 py-10 text-center text-[15px] text-[color:var(--gn-ink2)]">
          {t('This section is reserved for creator accounts.')}
        </div>
      </DashboardHomeShell>
    );
  }

  return (
    <DashboardHomeShell fullWidth newsTheme newsGround>
      {/* News / Products' frame: its edges sit under the top bar's (logo left, avatar right). */}
      <div className="w-full pb-8 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3">
        <div className="news-theme news-feed news-mono mx-auto w-full max-w-[1240px]">
          <CreatorProductViewContent productId={id} />
        </div>
      </div>
    </DashboardHomeShell>
  );
}
