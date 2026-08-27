'use client';

import { useCallback, useState } from 'react';
import { buildCreatorPortfolioUrl } from '@/lib/portfolio-url';

type PortfolioShareButtonProps = {
  creatorId: string;
  username?: string | null;
  creatorName: string;
  compact?: boolean;
};

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

export function PortfolioShareButton({
  creatorId,
  username,
  creatorName,
  compact = false,
}: PortfolioShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = buildCreatorPortfolioUrl(creatorId, username);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [shareUrl]);

  const className = compact
    ? 'inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-orange-300 hover:text-orange-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-orange-500/40 dark:hover:text-orange-300'
    : 'inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20';

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className={className}
      aria-label={`Copy portfolio link for ${creatorName}`}
    >
      <LinkIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {copied ? 'Link copied!' : compact ? 'Share' : 'Share portfolio'}
    </button>
  );
}

/** Banner for creator studio — copy + open portfolio. */
export function PortfolioShareBanner({
  creatorId,
  username,
}: {
  creatorId: string;
  username?: string | null;
}) {
  const shareUrl = buildCreatorPortfolioUrl(creatorId, username);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-orange-200/80 bg-orange-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-orange-500/30 dark:bg-orange-500/5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">Your public portfolio</p>
        <p className="mt-0.5 truncate text-xs text-neutral-600 dark:text-neutral-400">{shareUrl}</p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          Share this link to showcase your work — it&apos;s generated from your profile and public content.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void onCopy()}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          Preview
        </a>
      </div>
    </div>
  );
}
