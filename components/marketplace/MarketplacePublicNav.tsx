'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES, isPathWithin } from '@/lib/routes';

const NAV_LINK = 'rounded-lg px-3 py-2 text-sm font-medium';
const NAV_LINK_IDLE = `${NAV_LINK} text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-neutral-900`;
const NAV_LINK_ACTIVE = `${NAV_LINK} text-orange-600`;

export function MarketplacePublicNav({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const onProviders = isPathWithin(pathname, ROUTES.providers);
  const signInTarget = onProviders ? ROUTES.providers : ROUTES.marketplace;

  return (
    <header
      className={`border-b ${
        transparent
          ? 'border-gray-200/70 bg-transparent dark:border-neutral-800/70'
          : 'border-gray-200 bg-[#FFFFFF] dark:border-neutral-800 dark:bg-neutral-950'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
              NP
            </div>
            <span className="hidden font-semibold text-gray-900 dark:text-white sm:inline">Skraft</span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Marketplace">
            <Link
              href={ROUTES.providers}
              aria-current={onProviders ? 'page' : undefined}
              className={onProviders ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}
            >
              Providers
            </Link>
            <Link
              href={ROUTES.marketplace}
              aria-current={!onProviders ? 'page' : undefined}
              className={!onProviders ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}
            >
              Marketplace
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`${ROUTES.login}?redirect=${encodeURIComponent(signInTarget)}`}
            className={NAV_LINK_IDLE}
          >
            Sign in
          </Link>
          <Link
            href={ROUTES.register}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
