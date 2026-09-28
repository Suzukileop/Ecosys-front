'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { usePresence } from '@/hooks/usePresence';
import { buildCreatorPortfolioPath } from '@/lib/portfolio-url';
import type { MarketplaceCreatorSummary } from '@/types/marketplace';

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/** Compact provider line for the "All" tab — the full `CreatorCard` lives on the Service Provider tab. */
export function SearchServiceProviderRow({ creator }: { creator: MarketplaceCreatorSummary }) {
  const resolvedId = (creator.id ?? creator.userId ?? '').trim();
  const presenceUserId = (creator.userId ?? creator.id ?? '').trim();
  const presenceIds = useMemo(() => (presenceUserId ? [presenceUserId] : []), [presenceUserId]);
  const { isOnline } = usePresence(presenceIds);
  const online = Boolean(presenceUserId) && isOnline(presenceUserId);
  const statusLabel = online ? 'Online' : 'Offline';

  const profileHref = resolvedId ? `/marketplace/${resolvedId}` : null;
  const servicesHref = resolvedId ? `/marketplace/${resolvedId}?tab=services` : null;
  const portfolioHref = resolvedId ? buildCreatorPortfolioPath(resolvedId, creator.username) : null;
  const rating = creator.averageRating;
  const hasRating = rating !== null && rating !== undefined;

  const specialties = (creator.specialties ?? []).filter((item) => item.trim());
  const expertise =
    specialties.length > 0 ? specialties.join(' · ') : creator.specialite?.trim() || '';
  const name = creator.fullName ?? 'Provider';

  return (
    <article className="flex flex-wrap items-center gap-5 border-b border-black/[0.06] py-6 last:border-b-0 dark:border-white/[0.06] sm:flex-nowrap sm:gap-10">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="relative shrink-0" title={statusLabel}>
          <Avatar name={name} avatarUrl={creator.avatarUrl} size="lg" tone="muted" />
          <span
            role="status"
            aria-label={statusLabel}
            className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#111111] ${
              online ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-500'
            }`}
          />
        </div>

        <div className="min-w-0">
          {profileHref ? (
            <Link
              href={profileHref}
              className="block truncate text-lg font-semibold tracking-[-0.01em] text-black transition-colors hover:text-[#FF5722] dark:text-neutral-100"
            >
              {name}
            </Link>
          ) : (
            <p className="truncate text-lg font-semibold tracking-[-0.01em] text-black dark:text-neutral-100">{name}</p>
          )}
          {expertise ? (
            <p className="mt-1 line-clamp-1 text-[15px] text-neutral-600 dark:text-neutral-300">{expertise}</p>
          ) : null}
        </div>
      </div>

      {hasRating ? (
        <span
          className="inline-flex shrink-0 items-center gap-1.5 text-lg font-semibold tabular-nums text-[#111111] dark:text-white"
          aria-label={`Rating ${rating.toFixed(1)} out of 5`}
        >
          <StarIcon className="h-[18px] w-[18px] text-[#FF5722]" />
          {rating.toFixed(1)}
        </span>
      ) : null}

      <div className="ml-auto flex w-full shrink-0 items-center gap-2 sm:w-auto">
        {portfolioHref ? (
          <Link
            href={portfolioHref}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-black/[0.12] px-5 py-2.5 text-[15px] font-medium text-[#0A0A0A] transition-colors hover:border-black/30 dark:border-white/[0.12] dark:text-neutral-100 dark:hover:border-white/30 sm:flex-none"
          >
            Portfolio
          </Link>
        ) : null}
        {servicesHref ? (
          <Link
            href={servicesHref}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#0A0A0A] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#0A0A0A] sm:flex-none"
          >
            View service
          </Link>
        ) : null}
      </div>
    </article>
  );
}
