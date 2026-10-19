'use client';

import { localeTag, trPlural } from '@/lib/i18n/active';
import { useMemo } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { usePresence } from '@/hooks/usePresence';
import type { MarketplaceCreatorSummary } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/**
 * Compact provider line (the All tab's people block when only Service providers are shown) — the full
 * `CreatorCard` lives on the Service providers tab. Same row as SearchCreatorRow: 20px gutter on
 * phones, the fill tone on hover, one outlined pill that opens the profile.
 */
export function SearchServiceProviderRow({ creator }: { creator: MarketplaceCreatorSummary }) {
  const t = useT();
  const resolvedId = (creator.id ?? creator.userId ?? '').trim();
  const presenceUserId = (creator.userId ?? creator.id ?? '').trim();
  const presenceIds = useMemo(() => (presenceUserId ? [presenceUserId] : []), [presenceUserId]);
  const { isOnline } = usePresence(presenceIds);
  const online = Boolean(presenceUserId) && isOnline(presenceUserId);
  const statusLabel = online ? t('Online') : t('Offline');

  const profileHref = resolvedId ? `/providers/${resolvedId}` : null;
  const starCount = Math.max(0, creator.starCount ?? 0);

  const specialties = (creator.specialties ?? []).filter((item) => item.trim());
  const expertise =
    specialties.length > 0 ? specialties.join(' · ') : creator.specialite?.trim() || '';
  const name = creator.fullName ?? 'Provider';

  return (
    <div className="flex min-h-[72px] items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] sm:gap-4 sm:px-6">
      <div className="relative shrink-0" title={statusLabel}>
        <Avatar name={name} avatarUrl={creator.avatarUrl} size="lg" tone="muted" />
        {online ? (
          <span
            role="status"
            aria-label={statusLabel}
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[color:var(--gn-surface)] bg-[color:var(--gn-ink)]"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        {profileHref ? (
          <Link
            href={profileHref}
            className="block truncate text-[15px] font-bold leading-5 text-[color:var(--gn-ink)] underline-offset-2 hover:underline"
          >
            {name}
          </Link>
        ) : (
          <p className="truncate text-[15px] font-bold leading-5 text-[color:var(--gn-ink)]">{name}</p>
        )}
        {expertise ? (
          <p className="mt-0.5 line-clamp-1 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{expertise}</p>
        ) : null}
        {starCount > 0 ? (
          <p
            className="mt-1 inline-flex items-center gap-1 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]"
            aria-label={trPlural(starCount, '{count} trust star', '{count} trust stars')}
          >
            <StarIcon className="h-3.5 w-3.5 text-[color:var(--gn-ink)]" />
            <span className="font-semibold tabular-nums text-[color:var(--gn-ink)]">{starCount.toLocaleString(localeTag())}</span>
            {trPlural(starCount, 'star', 'stars')}
          </p>
        ) : null}
      </div>

      {profileHref ? (
        <Link href={profileHref} className="inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] dark:shadow-[inset_0_0_0_1px_#536471] sm:h-9">
          {t('Portfolio')}
        </Link>
      ) : null}
    </div>
  );
}
