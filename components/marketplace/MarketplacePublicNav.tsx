'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES, isPathWithin } from '@/lib/routes';
import { useT } from '@/lib/i18n/I18nProvider';

/* Signed-out marketplace bar, in the app header's X palette: secondary-ink links, the active one in
   ink with a 2px ink rule, one ink primary button (Sign up). No accent hue, no hairline. */
const NAV_LINK = 'relative inline-flex h-10 items-center rounded-full px-3 text-[15px]';
const NAV_LINK_IDLE = `${NAV_LINK} font-medium text-[#536471] hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]`;
const NAV_LINK_ACTIVE = `${NAV_LINK} font-bold text-[#0F1419] after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:bg-[#0F1419] dark:text-[#E7E9EA] dark:after:bg-[#E7E9EA]`;

export function MarketplacePublicNav({ transparent = false }: { transparent?: boolean }) {
  const t = useT();
  const pathname = usePathname();
  const onProviders = isPathWithin(pathname, ROUTES.providers);
  const signInTarget = onProviders ? ROUTES.providers : ROUTES.marketplace;

  return (
    <header
      className={transparent ? 'bg-transparent' : 'bg-white dark:bg-black'}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[19px] font-extrabold tracking-[-0.02em] text-[#0F1419] dark:text-[#E7E9EA]">Skraft</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label={t('Marketplace')}>
            <Link
              href={ROUTES.providers}
              aria-current={onProviders ? 'page' : undefined}
              className={onProviders ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}
            >
              {t('Providers')}
            </Link>
            <Link
              href={ROUTES.marketplace}
              aria-current={!onProviders ? 'page' : undefined}
              className={!onProviders ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}
            >
              {t('Marketplace')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`${ROUTES.login}?redirect=${encodeURIComponent(signInTarget)}`}
            className={NAV_LINK_IDLE}
          >
            {t('Sign in')}
          </Link>
          <Link
            href={ROUTES.register}
            className="inline-flex h-10 items-center rounded-none bg-[#0F1419] px-4 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]"
          >
            {t('Sign up')}
          </Link>
        </div>
      </div>
    </header>
  );
}
