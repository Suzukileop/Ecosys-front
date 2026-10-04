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

/** Primary CTA — highest-intent action on a public creator profile. */
const primaryButtonClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#111111] px-5 text-[15px] font-medium text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:bg-white dark:text-[#111111] dark:hover:bg-neutral-200 dark:focus-visible:ring-white/30';

export function OrderCreatorCta({ creatorId, creatorName, isAuthenticated }: OrderCreatorCtaProps) {
  const profileUrl = `/marketplace/${creatorId}`;
  const discussUrl = `/dashboard/discussions?user=${encodeURIComponent(creatorId)}`;
  const a11yLabel = creatorName ? `Discuss with ${creatorName}` : 'Discuss with creator';

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(discussUrl)}`}
        className={primaryButtonClass}
        title="Sign in to discuss"
        aria-label={a11yLabel}
      >
        <MessageIcon className="h-4 w-4" />
        Discuss
      </Link>
    );
  }

  return (
    <Link href={discussUrl} className={primaryButtonClass} title={a11yLabel} aria-label={a11yLabel}>
      <MessageIcon className="h-4 w-4" />
      Discuss
    </Link>
  );
}
