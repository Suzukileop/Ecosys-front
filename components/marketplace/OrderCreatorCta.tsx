'use client';

import Link from 'next/link';

type OrderCreatorCtaProps = {
  creatorId: string;
  creatorName?: string;
  isAuthenticated: boolean;
};

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

const iconButtonClass =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800';

export function OrderCreatorCta({ creatorId, creatorName, isAuthenticated }: OrderCreatorCtaProps) {
  const profileUrl = `/marketplace/${creatorId}`;
  const discussUrl = `/dashboard/discussions?user=${encodeURIComponent(creatorId)}`;
  const label = creatorName ? `Discuter avec ${creatorName}` : 'Discuter avec le créateur';

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(profileUrl)}`}
        className={iconButtonClass}
        title="Se connecter pour discuter"
        aria-label="Se connecter pour discuter"
      >
        <MessageIcon className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link href={discussUrl} className={iconButtonClass} title={label} aria-label={label}>
      <MessageIcon className="h-5 w-5" />
    </Link>
  );
}
