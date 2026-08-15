'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorsCatalog } from '@/components/marketplace/CreatorsCatalog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

/** Service providers directory — visible to all authenticated members. */
export function ServiceProviderCatalogGate() {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <CreatorsCatalog />;
}
