import Link from 'next/link';
import { CreatorAvailabilityBadge } from '@/components/creator/studio/CreatorAvailabilityControl';

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hueFromId(id: string) {
  const s = id ?? '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * 17) % 360;
  return h;
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm"
      title="Verified creator"
      aria-label="Verified creator"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
      <StarIcon className="h-3 w-3" />
      {rating.toFixed(1)}
    </span>
  );
}

function NewBadge() {
  return (
    <span className="shrink-0 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-400">
      New
    </span>
  );
}

type CreatorCardProps = {
  /** Identifiant créateur pour l’URL ; `userId` sert de repli si l’API ne renvoie que celui-ci. */
  id?: string;
  userId?: string;
  fullName?: string;
  avatarUrl?: string | null;
  specialite: string | null;
  bio?: string | null;
  isVerified: boolean;
  isAvailable?: boolean;
  serviceCount?: number;
  averageRating?: number | null;
};

export function CreatorCard({
  id,
  userId,
  fullName,
  avatarUrl,
  specialite,
  bio,
  isVerified,
  isAvailable = true,
  serviceCount,
  averageRating,
}: CreatorCardProps) {
  const resolvedId = (id ?? userId ?? '').trim();
  const hue = hueFromId(resolvedId || 'unknown');
  const services = serviceCount ?? 0;
  const hasRating = averageRating !== null && averageRating !== undefined;
  const isNew = !hasRating && !isVerified && services === 0;
  const bioText = bio?.trim() || '';

  const cardClassName =
    `group flex min-h-[168px] overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-neutral-900 ${
      isAvailable
        ? 'border-gray-100 hover:border-orange-200 dark:border-neutral-800 dark:hover:border-orange-500/30'
        : 'border-gray-100 opacity-90 hover:border-gray-200 dark:border-neutral-800'
    }`;

  const body = (
    <>
      <div className="relative w-36 shrink-0 self-stretch sm:w-44">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: `hsl(${hue} 55% 42%)` }}
            aria-hidden
          >
            {initialsFromName(fullName ?? '')}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-lg font-bold text-gray-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
            {fullName ?? 'Creator'}
          </p>
          {hasRating ? (
            <RatingBadge rating={averageRating} />
          ) : isVerified ? (
            <VerifiedBadge />
          ) : isNew ? (
            <NewBadge />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {specialite ? (
            <span className="text-sm text-gray-500 dark:text-gray-400">{specialite}</span>
          ) : null}
          <CreatorAvailabilityBadge isAvailable={isAvailable} />
        </div>

        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{services}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Services
          </p>
        </div>

        {bioText ? (
          <p className="mt-auto line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {bioText}
          </p>
        ) : (
          <div className="mt-auto" />
        )}
      </div>
    </>
  );

  if (!resolvedId) {
    return (
      <div className={`${cardClassName} cursor-default opacity-90`} role="article">
        {body}
      </div>
    );
  }

  return (
    <Link href={`/marketplace/${resolvedId}`} className={cardClassName}>
      {body}
    </Link>
  );
}
