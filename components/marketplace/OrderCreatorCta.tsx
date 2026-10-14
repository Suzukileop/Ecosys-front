'use client';

import Link from 'next/link';
import { PROVIDER_ACCENT_BUTTON_CLASS } from '@/components/marketplace/ProviderDirectoryPrimitives';
import { PROFILE_MOBILE_PRIMARY_BUTTON } from '@/components/creator/creator-profile-header-types';
import { useT } from '@/lib/i18n/I18nProvider';

type OrderCreatorCtaProps = {
  creatorId: string;
  creatorName?: string;
  isAuthenticated: boolean;
  /** `compact`: the phone action row (36px, full width of its cell). */
  size?: 'default' | 'compact';
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

/** Primary CTA — highest-intent action on a public creator profile: the ink primary button, as Discuss in the directory. */
const primaryButtonClass = `inline-flex h-11 items-center justify-center gap-2 rounded-none px-5 text-[15px] font-bold transition-colors focus-visible:outline-none ${PROVIDER_ACCENT_BUTTON_CLASS}`;

const compactButtonClass = `${PROFILE_MOBILE_PRIMARY_BUTTON} w-full`;

export function OrderCreatorCta({ creatorId, creatorName, isAuthenticated, size = 'default' }: OrderCreatorCtaProps) {
  const t = useT();
  const buttonClass = size === 'compact' ? compactButtonClass : primaryButtonClass;
  const discussUrl = `/messages?user=${encodeURIComponent(creatorId)}`;
  const a11yLabel = creatorName ? `Discuss with ${creatorName}` : t('Discuss with creator');

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(discussUrl)}`}
        className={buttonClass}
        title={t('Sign in to discuss')}
        aria-label={a11yLabel}
      >
        <MessageIcon className="h-4 w-4" />
        {t('Discuss')}
      </Link>
    );
  }

  return (
    <Link href={discussUrl} className={buttonClass} title={a11yLabel} aria-label={a11yLabel}>
      <MessageIcon className="h-4 w-4" />
      {t('Discuss')}
    </Link>
  );
}
