import type { ReactNode, SVGProps } from 'react';

export type SocialPlatformKey =
  | 'youtube'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'other';

export type NeutralIconName = 'clock' | 'languages' | 'location' | 'address' | 'email' | 'phone' | 'website' | 'link';

const NEUTRAL_ICON_SHELL =
  'flex shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';

const ACCENT_ICON_SHELL =
  'flex shrink-0 items-center justify-center rounded-xl border border-orange-200/80 bg-orange-50 text-orange-600 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-400';

const ICON_PATHS: Record<NeutralIconName, ReactNode> = {
  clock: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  ),
  languages: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 3 6.5c0 1.2.14 2.36.404 3.47M21 5l-4.5 9.5M16 5l4.5 9.5M9 14.5h6" />
  ),
  location: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </>
  ),
  address: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
  ),
  email: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
  ),
  phone: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 5a2 2 0 0 1 2-2h2.28a1 1 0 0 1 .95.68l1.12 3.36a1 1 0 0 1-.5 1.2l-1.27.64a11.04 11.04 0 0 0 5.18 5.18l.64-1.27a1 1 0 0 1 1.2-.5l3.36 1.12a1 1 0 0 1 .68.95V19a2 2 0 0 1-2 2h-1C9.16 21 3 14.84 3 7V5z"
    />
  ),
  website: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
    />
  ),
  link: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"
    />
  ),
};

const ICON_SIZES = {
  sm: { shell: 'h-9 w-9', svg: 'h-4 w-4' },
  md: { shell: 'h-10 w-10', svg: 'h-5 w-5' },
  lg: { shell: 'h-12 w-12', svg: 'h-6 w-6' },
} as const;

export function NeutralIconBadge({
  name,
  size = 'md',
  accent = false,
}: {
  name: NeutralIconName;
  size?: keyof typeof ICON_SIZES;
  accent?: boolean;
}) {
  const dimensions = ICON_SIZES[size];
  const shell = accent ? ACCENT_ICON_SHELL : NEUTRAL_ICON_SHELL;
  return (
    <div className={`${shell} ${dimensions.shell}`}>
      <svg className={dimensions.svg} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        {ICON_PATHS[name]}
      </svg>
    </div>
  );
}

export function normalizeSocialPlatformKey(platform: string): SocialPlatformKey {
  const key = platform.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key.includes('youtube') || key === 'youtube') return 'youtube';
  if (key.includes('instagram')) return 'instagram';
  if (key.includes('tiktok')) return 'tiktok';
  if (key.includes('linkedin')) return 'linkedin';
  if (key.includes('github')) return 'github';
  if (key.includes('twitter') || key === 'x') return 'twitter';
  if (key.includes('facebook') || key === 'fb' || key.includes('fbcom') || key.includes('fbme')) {
    return 'facebook';
  }
  return 'other';
}

const BRAND_STYLES: Record<SocialPlatformKey, string> = {
  youtube: 'bg-[#FF0000] text-white',
  instagram: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white',
  tiktok: 'bg-black text-white',
  linkedin: 'bg-[#0A66C2] text-white',
  github: 'bg-[#24292F] text-white',
  twitter: 'bg-black text-white',
  facebook: 'bg-[#1877F2] text-white',
  other: 'bg-neutral-800 text-white dark:bg-neutral-700',
};

export function socialPlatformBrandClass(platform: string): string {
  return BRAND_STYLES[normalizeSocialPlatformKey(platform)];
}

export function SocialPlatformIcon({
  platform,
  className = 'h-5 w-5',
}: {
  platform: string;
  className?: string;
}) {
  const key = normalizeSocialPlatformKey(platform);

  switch (key) {
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.27a8.2 8.2 0 0 0 4.78 1.52V7.34a4.85 4.85 0 0 1-1-.65z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'github':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      );
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.2v2H7.5v3h2.8v8h3.4Z" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          {ICON_PATHS.link}
        </svg>
      );
  }
}

export function ExternalLinkChevron({ className = 'h-4 w-4' }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7v8" />
    </svg>
  );
}
