import { Suspense } from 'react';
import { ServiceProviderCatalogGate } from '@/components/marketplace/ServiceProviderCatalogGate';
import { ProvidersCatalogSkeleton } from '@/components/marketplace/ProvidersCatalogSkeleton';
import { normalizeCreatorSummary, serverMarketplaceFetch } from '@/lib/marketplace-api';
import type { MarketplaceCreatorsPage } from '@/types/marketplace';

/** Query keys the catalog filters on; any of them means the default first page does not apply. */
const FILTER_KEYS = ['q', 'genre', 'verified', 'available', 'near', 'sort', 'nationality', 'minYears', 'page'];

/*
 * The first page of the unfiltered directory is rendered on the server (public data, cached 60 s):
 * on a phone the cards used to wait for the whole bundle to hydrate before their request even
 * started (~14 s on a throttled mid-range device). The client still refreshes it after hydration.
 */
async function loadInitialPage(): Promise<MarketplaceCreatorsPage | null> {
  const raw = await serverMarketplaceFetch<MarketplaceCreatorsPage>('/api/marketplace/creators?page=0&size=12', {
    revalidate: 60,
  });
  if (!raw || !Array.isArray(raw.content)) return null;
  return {
    ...raw,
    content: raw.content.map((row) => normalizeCreatorSummary(row as unknown as Record<string, unknown>)),
  };
}

export default async function MarketplaceCreatorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filtered = FILTER_KEYS.some((key) => params[key] != null && params[key] !== '');
  const initialPage = filtered ? null : await loadInitialPage();
  return (
    <Suspense fallback={<ProvidersCatalogSkeleton />}>
      <ServiceProviderCatalogGate initialPage={initialPage} />
    </Suspense>
  );
}
