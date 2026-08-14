'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorsCatalog } from '@/components/marketplace/CreatorsCatalog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import { useAuth } from '@/context/AuthContext';

/** Members directory — available only to Service Provider app role. */
export function ServiceProviderCatalogGate() {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();
  const { appRole, ready } = useCreatorAppRole();

  useEffect(() => {
    if (authLoading || !ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (appRole !== 'SERVICE_PROVIDER') {
      router.replace('/dashboard/services');
    }
  }, [authLoading, ready, user, appRole, router]);

  if (authLoading || !ready || !user || appRole !== 'SERVICE_PROVIDER') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <CreatorsCatalog />;
}
