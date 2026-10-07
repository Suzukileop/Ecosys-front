'use client';
import {
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import {
  resolveLinkBrandIconMetrics,
  type LinkBrandIconVisualSize,
} from '@/components/portfolio/portfolio-nav-tri-zone-social';

/** Infer brand key from URL hostname (and optional stored platform). */
function inferLinkBrand(
  url: string,
  platform?: string | null
): 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM' | 'LINKEDIN' | 'GITHUB' | 'TWITTER' | 'FACEBOOK' | 'WEBSITE' {
  const stored = platform?.trim().toUpperCase();
  if (
    stored === 'YOUTUBE' ||
    stored === 'TIKTOK' ||
    stored === 'INSTAGRAM' ||
    stored === 'LINKEDIN' ||
    stored === 'GITHUB' ||
    stored === 'TWITTER' ||
    stored === 'FACEBOOK'
  ) {
    return stored;
  }

  let host = '';
  try {
    const withProtocol = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    host = new URL(withProtocol).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    host = url.toLowerCase();
  }

  if (host.includes('youtube') || host === 'youtu.be') return 'YOUTUBE';
  if (host.includes('tiktok')) return 'TIKTOK';
  if (host.includes('instagram')) return 'INSTAGRAM';
  if (host.includes('linkedin')) return 'LINKEDIN';
  if (host.includes('github')) return 'GITHUB';
  if (host.includes('twitter') || host === 'x.com' || host.endsWith('.x.com')) return 'TWITTER';
  if (host.includes('facebook') || host.includes('fb.com') || host.includes('fb.me')) {
    return 'FACEBOOK';
  }
  return 'WEBSITE';
}

function BrowserLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M2.5 12h19M12 2.5c2.5 2.8 3.8 6.1 3.8 9.5S14.5 18.7 12 21.5C9.5 18.7 8.2 15.4 8.2 12S9.5 5.3 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4.2 7.2h15.6M4.2 16.8h15.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkBrandIcon({
  url,
  platform,
  iconUrl,
  size = 'card',
  monochrome = false,
}: {
  url: string;
  platform?: string | null;
  iconUrl?: string | null;
  size?: LinkBrandIconVisualSize;
  monochrome?: boolean;
}) {
  const metrics = resolveLinkBrandIconMetrics(size);
  const shell = metrics.shell;
  const monoClass = monochrome ? 'grayscale text-neutral-800 dark:text-neutral-100' : '';
  const customIcon = iconUrl?.trim();
  if (customIcon) {
    return (
      <span
        className={`inline-flex ${shell} shrink-0 overflow-hidden rounded-full ${monoClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customIcon}
          alt=""
          className={`h-full w-full object-cover ${monochrome ? 'grayscale' : ''}`}
        />
      </span>
    );
  }

  const brand = inferLinkBrand(url, platform);
  const glyph = metrics.glyph;
  const facebookGlyph = metrics.facebook;

  if (brand === 'WEBSITE') {
    return (
      <span
        className={`inline-flex ${shell} shrink-0 items-center justify-center rounded-full ${
          monochrome
            ? 'bg-neutral-200/80 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100'
            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
        }`}
      >
        <BrowserLogo className={glyph} />
      </span>
    );
  }

  if (brand === 'FACEBOOK') {
    return (
      <span
        className={`inline-flex ${shell} shrink-0 items-center justify-center rounded-full ${
          monochrome ? monoClass : 'text-[#1877F2]'
        }`}
      >
        <FacebookLogo className={facebookGlyph} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex ${shell} shrink-0 items-center justify-center rounded-full ${
        monochrome ? `bg-neutral-100 ${monoClass} dark:bg-neutral-800` : socialPlatformBrandClass(brand)
      }`}
    >
      <SocialPlatformIcon platform={brand} className={glyph} />
    </span>
  );
}

export { LinkBrandIcon };
