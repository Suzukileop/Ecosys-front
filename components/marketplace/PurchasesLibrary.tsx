'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { listMyPurchases } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { MarketplacePurchasesSkeleton } from '@/components/marketplace/MarketplaceSkeleton';
import { marketplaceProductGridClassName } from '@/components/marketplace/ProductCard';
import { PurchaseLibraryCard } from '@/components/marketplace/PurchaseLibraryCard';
import { useAuth } from '@/context/AuthContext';

export function PurchasesPanel() {
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<Awaited<ReturnType<typeof listMyPurchases>>['content']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setItems([]);
      const page = await listMyPurchases(0, 50);
      setItems(page.content);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load your library.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      setItems([]);
      return;
    }
    if (user) {
      void load();
      return;
    }
    setLoading(false);
    setItems([]);
  }, [isLoading, user, load]);

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading || isLoading ? (
        <MarketplacePurchasesSkeleton />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-gray-700 dark:text-gray-300">Your library is empty.</p>
          <Link
            href="/marketplace"
            className="mt-6 inline-flex rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className={marketplaceProductGridClassName}>
          {items.map((purchase) => (
            <PurchaseLibraryCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PurchasesLibrary() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My purchases</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Digital products you own. Download securely anytime from your library.
        </p>
      </div>
      <PurchasesPanel />
    </div>
  );
}
