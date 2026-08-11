'use client';

import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { MarketplaceCatalogSection } from '@/components/marketplace/MarketplaceCatalogSection';

export function FavoritesPanel() {
  return <MarketplaceCatalogSection favoritesOnly />;
}

export function FavoritesLibrary() {
  return (
    <DashboardHomeShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My favorites</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your saved products — same catalog view with search and filters.
          </p>
        </div>
        <FavoritesPanel />
      </div>
    </DashboardHomeShell>
  );
}
