'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export const NEWS_OPEN_PUBLISH_EVENT = 'noproble:open-news-publish';

export function dispatchNewsOpenPublish() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NEWS_OPEN_PUBLISH_EVENT));
}

const publishClassName =
  'inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 px-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40';

/** Compact News CTA for the dashboard top header (left). */
export function NewsPublishHeaderCta({ className = '' }: { className?: string }) {
  const { hasRole } = useAuth();
  const canPublish = hasRole('ROLE_CREATOR');

  return (
    <div
      className={`flex min-w-0 max-w-full items-center gap-2.5 sm:gap-3 ${className}`}
    >
      <p className="hidden min-w-0 truncate text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 md:block">
        Don&apos;t stay a spectator.
      </p>
      {canPublish ? (
        <button type="button" onClick={dispatchNewsOpenPublish} className={publishClassName}>
          + Publish content
        </button>
      ) : (
        <Link href="/dashboard/creator" className={publishClassName}>
          + Publish content
        </Link>
      )}
    </div>
  );
}
