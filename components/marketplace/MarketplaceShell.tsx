'use client';

import { usePathname } from 'next/navigation';
import {
  isContentCreatorsPath,
  isCreatorShopPath,
  isMarketplaceCreatorProfilePath,
  isServiceProvidersCatalogPath,
} from '@/lib/marketplace-nav';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MarketplacePublicNav } from '@/components/marketplace/MarketplacePublicNav';
import { MarketplacePatternBackground } from '@/components/marketplace/ProductDetailHalftoneBackground';
import { APP_GROUND } from '@/components/landing/landingBrand';

type MarketplaceShellProps = {
  children: React.ReactNode;
  authenticated: boolean;
};

function isProductDetailPath(pathname: string): boolean {
  return /^\/marketplace\/products\/[^/]+$/.test(pathname);
}

function isMarketplaceHubPath(pathname: string): boolean {
  return pathname === '/marketplace';
}

function getPatternVariant(pathname: string): 'hub' | 'product' | null {
  if (
    isProductDetailPath(pathname) ||
    isMarketplaceCreatorProfilePath(pathname) ||
    isCreatorShopPath(pathname)
  ) {
    return null;
  }
  if (isServiceProvidersCatalogPath(pathname) || isMarketplaceHubPath(pathname)) return null;
  if (isContentCreatorsPath(pathname)) return 'hub';
  return null;
}

/**
 * Wraps marketplace pages with the dashboard chrome when a session cookie exists.
 */
export function MarketplaceShell({ children, authenticated }: MarketplaceShellProps) {
  const pathname = usePathname();
  const patternVariant = getPatternVariant(pathname);
  const hasPattern = patternVariant !== null;

  if (!authenticated) {
    return (
      <div
        data-app-surfaces=""
        className={
          hasPattern
            ? 'relative min-h-screen'
            : `min-h-screen ${APP_GROUND} dark:bg-black`
        }
      >
        {patternVariant && <MarketplacePatternBackground variant={patternVariant} />}
        <div className="relative z-10">
          <MarketplacePublicNav transparent={patternVariant === 'hub'} />
          {children}
        </div>
      </div>
    );
  }

  return (
    <>
      {patternVariant && <MarketplacePatternBackground variant={patternVariant} />}
      <DashboardShell transparentContent={hasPattern} transparentHeader={patternVariant === 'hub'}>
        {children}
      </DashboardShell>
    </>
  );
}
