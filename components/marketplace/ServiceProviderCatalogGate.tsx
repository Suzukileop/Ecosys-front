'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorsCatalog } from '@/components/marketplace/CreatorsCatalog';
import { ProvidersCatalogSkeleton } from '@/components/marketplace/ProvidersCatalogSkeleton';
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
    return <ProvidersCatalogSkeleton />;
  }

  return <CreatorsCatalog />;
}
