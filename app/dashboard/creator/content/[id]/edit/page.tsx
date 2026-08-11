'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/** Legacy form route — editing is inline on the Content tab. */
export default function EditCreatorContentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/creator?tab=content');
  }, [router]);

  return (
    <DashboardHomeShell>
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    </DashboardHomeShell>
  );
}
