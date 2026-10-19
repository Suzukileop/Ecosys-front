'use client';

import { CreatorsCatalog } from '@/components/marketplace/CreatorsCatalog';
import { ProvidersCatalogSkeleton } from '@/components/marketplace/ProvidersCatalogSkeleton';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceCreatorsPage } from '@/types/marketplace';

/**
 * Service providers directory — open to everyone. The landing's "Find a provider" links here, and
 * the list API is public: guests used to get a skeleton, then a bounce to /login (without a way
 * back). Members-only actions (messaging a provider) send guests to /login from the card itself.
 */
export function ServiceProviderCatalogGate({
  initialPage = null,
}: {
  /** First page rendered on the server (unfiltered directory); null when filters are set. */
  initialPage?: MarketplaceCreatorsPage | null;
}) {
  const { isLoading: authLoading } = useAuth();

  /* Wait for the session restore so a member's first fetch already carries their token. */
  if (authLoading) {
    return <ProvidersCatalogSkeleton />;
  }

  return <CreatorsCatalog initialPage={initialPage} />;
}
