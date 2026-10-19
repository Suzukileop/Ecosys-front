'use client';

/**
 * Contact links and social / contact icons shared by the contact section, the footer and the footer / contact design files.
 * Split out of portfolio-section-primitives so the public portfolio only downloads the sections it
 * renders (each is loaded with next/dynamic by PublicCreatorPortfolioPage).
 */
import { type CSSProperties } from 'react';
import { normalizeSocialPlatformKey, SocialPlatformIcon, socialPlatformBrandClass } from '@/components/marketplace/creator-profile-social-icons';

export function ArrowUpRight({
  className,
  style,
  noColorTransition = false,
}: {
  className?: string;
  style?: CSSProperties;
  noColorTransition?: boolean;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      {...(noColorTransition ? { 'data-pf-no-color-transition': '' } : {})}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

export function ContactEmailIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  );
}

export function ContactPhoneIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
      />
    </svg>
  );
}

export function ContactLocationIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
      />
    </svg>
  );
}

export type EditorialContactLink = {
  id: string;
  label: string;
  url: string;
  type: string;
  platform?: string | null;
};

export function inferContactLinkPlatform(link: EditorialContactLink): string | null {
  if (link.platform?.trim()) return link.platform.trim();

  const haystack = `${link.url} ${link.label}`.toLowerCase();
  if (haystack.includes('youtube') || haystack.includes('youtu.be')) return 'YOUTUBE';
  if (haystack.includes('tiktok')) return 'TIKTOK';
  if (haystack.includes('instagram')) return 'INSTAGRAM';
  if (haystack.includes('linkedin')) return 'LINKEDIN';
  if (haystack.includes('github')) return 'GITHUB';
  if (haystack.includes('twitter') || haystack.includes('x.com')) return 'TWITTER';
  if (haystack.includes('facebook') || haystack.includes('fb.com') || haystack.includes('fb.me')) {
    return 'FACEBOOK';
  }

  return link.type === 'SOCIAL' ? link.label : null;
}

export function FooterSocialLinkIcon({
  link,
  bare = false,
  iconClassName = 'h-4 w-4',
}: {
  link: EditorialContactLink;
  /** Icon only — no colored circular chip (landing-style buttons). */
  bare?: boolean;
  iconClassName?: string;
}) {
  const platform = inferContactLinkPlatform(link);
  const socialKey = platform ? normalizeSocialPlatformKey(platform) : 'other';
  const isSocial = socialKey !== 'other';

  if (isSocial && platform) {
    if (bare) {
      return <SocialPlatformIcon platform={platform} className={iconClassName} />;
    }
    return (
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${socialPlatformBrandClass(platform)}`}
      >
        <SocialPlatformIcon platform={platform} className={iconClassName} />
      </span>
    );
  }

  const isWebsite = link.type === 'WEBSITE';
  if (bare) {
    return (
      <svg className={iconClassName} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        {isWebsite ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"
          />
        )}
      </svg>
    );
  }

  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
        isWebsite
          ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300'
          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
      }`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        {isWebsite ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"
          />
        )}
      </svg>
    </span>
  );
}

export function FooterContactIcon({
  type,
  className = 'h-4 w-4',
  style,
}: {
  type: 'phone' | 'email' | 'location' | 'hours';
  className?: string;
  style?: CSSProperties;
}) {
  if (type === 'phone') {
    return (
      <span className="inline-flex" style={style}>
        <ContactPhoneIcon className={className} />
      </span>
    );
  }
  if (type === 'email') {
    return (
      <span className="inline-flex" style={style}>
        <ContactEmailIcon className={className} />
      </span>
    );
  }
  if (type === 'location') {
    return (
      <span className="inline-flex" style={style}>
        <ContactLocationIcon className={className} />
      </span>
    );
  }
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
      />
    </svg>
  );
}
