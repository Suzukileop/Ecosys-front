'use client';
import { SocialPlatformIcon } from '@/components/marketplace/creator-profile-social-icons';

export function TeamSocialGlyph({ platform, className }: { platform: string; className?: string }) {
  const glyph = className ?? 'h-3.5 w-3.5';
  if (platform === 'EMAIL') {
    return (
      <svg className={glyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path d="M3.5 6.5h17v11h-17z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }
  if (platform === 'FACEBOOK') {
    return (
      <svg className={glyph} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.2v2H7.5v3h2.8v8h3.4Z" />
      </svg>
    );
  }
  if (platform === 'WEBSITE') {
    return (
      <svg className={glyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" />
      </svg>
    );
  }
  return <SocialPlatformIcon platform={platform} className={glyph} />;
}
