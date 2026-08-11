'use client';

import { recordShare } from '@/lib/marketplace-api';
import type { SocialTargetType } from '@/types/marketplace';

type ShareButtonsProps = {
  targetType: SocialTargetType;
  targetId: string;
  shareUrl: string;
  shareTitle: string;
  isAuthenticated: boolean;
};

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const shareButtonClassName =
  'inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-200 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10 dark:hover:text-orange-200';

export function ShareButtons({
  targetType,
  targetId,
  shareUrl,
  shareTitle,
  isAuthenticated,
}: ShareButtonsProps) {
  const trackShare = (platform: string) => {
    if (!isAuthenticated) return;
    void recordShare(targetType, targetId, platform).catch(() => undefined);
  };

  const onShare = async (platform: string) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        trackShare('copy');
      } catch {
        // ignore clipboard errors
      }
      return;
    }

    const encoded = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareTitle);
    let url = shareUrl;

    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    }

    trackShare(platform);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => void onShare('copy')} className={shareButtonClassName}>
        Copy link
      </button>
      <button
        type="button"
        onClick={() => void onShare('twitter')}
        className={`${shareButtonClassName} h-9 w-9 px-0`}
        aria-label="Share on X"
      >
        <IconX className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => void onShare('facebook')}
        className={`${shareButtonClassName} h-9 w-9 px-0`}
        aria-label="Share on Facebook"
      >
        <IconFacebook className="h-5 w-5" />
      </button>
    </div>
  );
}
