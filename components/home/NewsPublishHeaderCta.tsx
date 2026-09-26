'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export const NEWS_OPEN_PUBLISH_EVENT = 'noproble:open-news-publish';
/** Marker for the in-feed CTA — header shows a twin once this leaves view. */
export const NEWS_INLINE_PUBLISH_CTA_ID = 'news-publish-cta-inline';

export function dispatchNewsOpenPublish() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NEWS_OPEN_PUBLISH_EVENT));
}

const publishClassName =
  'inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 px-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40';

/**
 * The short form below `sm` buys back ~55px in a single-row bar where the navigation rail is the
 * thing paying for every pixel this CTA takes.
 */
function PublishLabel() {
  return (
    <>
      <span className="sm:hidden">+ Publish</span>
      <span className="hidden sm:inline">+ Publish content</span>
    </>
  );
}

/*
 * The strapline is decoration, so it only appears once the row can spare ~140px for it (`2xl`).
 * At `xl` it collided by 3px with the shortcuts pinned to the viewport midpoint — the tagline was
 * switching on at the same breakpoint as the pin, which is the width where the right block is
 * widest and the centre block has just stopped being kept clear by flex.
 */
type NewsPublishHeaderCtaProps = {
  className?: string;
  /** When true, marks the in-feed instance for scroll handoff to the sticky header. */
  inline?: boolean;
};

/** News publish CTA — full-width bar below create shortcuts, or compact twin in the sticky header. */
export function NewsPublishHeaderCta({ className = '', inline = false }: NewsPublishHeaderCtaProps) {
  const { hasRole } = useAuth();
  const canPublish = hasRole('ROLE_CREATOR');

  const action = canPublish ? (
    <button type="button" onClick={dispatchNewsOpenPublish} className={publishClassName}>
      <PublishLabel />
    </button>
  ) : (
    <Link href="/dashboard/creator" className={publishClassName}>
      <PublishLabel />
    </Link>
  );

  return (
    <div
      id={inline ? NEWS_INLINE_PUBLISH_CTA_ID : undefined}
      className={
        inline
          ? `flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:px-5 ${className}`
          : `flex min-w-0 max-w-full items-center gap-2.5 sm:gap-3 ${className}`
      }
    >
      <p
        className={`min-w-0 truncate font-semibold tracking-tight text-neutral-800 dark:text-neutral-100 ${
          inline ? 'text-sm sm:text-base' : 'hidden text-sm 2xl:block'
        }`}
      >
        Don&apos;t stay a spectator.
      </p>
      {action}
    </div>
  );
}
