'use client';

import type { ReactNode } from 'react';
import type { PortfolioNavContactCtaIcon } from '@/components/portfolio/portfolio-settings-types';

function PhoneGlyphBase({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Classic curved handset. */
function PhoneClassicIcon({ className }: { className?: string }) {
  return (
    <PhoneGlyphBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 5.2c.4-1 1.5-1.3 2.3-.6l1.4 1.1c.7.6.8 1.6.3 2.3l-.8 1.1a11.5 11.5 0 005.6 5.6l1.1-.8c.7-.5 1.7-.4 2.3.3l1.1 1.4c.7.8.4 1.9-.6 2.3-1 .4-2.1.6-3.2.6a11 11 0 01-11-11c0-1.1.2-2.2.6-3.2z"
      />
    </PhoneGlyphBase>
  );
}

/** Filled-style outline handset (heroicons phone). */
function PhoneHandsetIcon({ className }: { className?: string }) {
  return (
    <PhoneGlyphBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </PhoneGlyphBase>
  );
}

/** Vertical smartphone. */
function PhoneSmartphoneIcon({ className }: { className?: string }) {
  return (
    <PhoneGlyphBase className={className}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path strokeLinecap="round" d="M11 18.5h2" />
    </PhoneGlyphBase>
  );
}

/** Handset with ringing sound waves. */
function PhoneCallIcon({ className }: { className?: string }) {
  return (
    <PhoneGlyphBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.8 5.4c.35-.85 1.3-1.1 2-.5l1.2.95c.6.5.7 1.35.25 1.95l-.7.95a10 10 0 004.85 4.85l.95-.7c.6-.45 1.45-.35 1.95.25l.95 1.2c.6.7.35 1.65-.5 2-.85.35-1.8.5-2.75.5A9.5 9.5 0 017.3 8.15c0-.95.15-1.9.5-2.75z"
      />
      <path strokeLinecap="round" d="M16.2 4.5c1.1.7 2 1.7 2.55 2.9M18.1 3c1.55 1 2.8 2.45 3.5 4.15" />
    </PhoneGlyphBase>
  );
}

/** Handset with outgoing arrow. */
function PhoneOutgoingIcon({ className }: { className?: string }) {
  return (
    <PhoneGlyphBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 5.3c.35-.9 1.3-1.15 2-.55l1.15.9c.6.5.7 1.35.25 1.95l-.65.9a9.5 9.5 0 004.55 4.55l.9-.65c.6-.45 1.45-.35 1.95.25l.9 1.15c.6.7.35 1.65-.55 2-.8.3-1.7.45-2.6.45A9 9 0 017 8.1c0-.9.15-1.8.5-2.8z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 4.5h4.5V9M19.5 4.5L14 10" />
    </PhoneGlyphBase>
  );
}

/** Handset with incoming arrow. */
function PhoneIncomingIcon({ className }: { className?: string }) {
  return (
    <PhoneGlyphBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 5.3c.35-.9 1.3-1.15 2-.55l1.15.9c.6.5.7 1.35.25 1.95l-.65.9a9.5 9.5 0 004.55 4.55l.9-.65c.6-.45 1.45-.35 1.95.25l.9 1.15c.6.7.35 1.65-.55 2-.8.3-1.7.45-2.6.45A9 9 0 017 8.1c0-.9.15-1.8.5-2.8z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5L14 10m0 0h4.2M14 10V5.8" />
    </PhoneGlyphBase>
  );
}

const CONTACT_CTA_ICON_RENDERERS: Record<
  PortfolioNavContactCtaIcon,
  (props: { className?: string }) => ReactNode
> = {
  phone: PhoneClassicIcon,
  'phone-handset': PhoneHandsetIcon,
  smartphone: PhoneSmartphoneIcon,
  'phone-call': PhoneCallIcon,
  'phone-outgoing': PhoneOutgoingIcon,
  'phone-incoming': PhoneIncomingIcon,
};

export function PortfolioNavContactCtaGlyph({
  variant,
  className = 'h-4 w-4',
}: {
  variant: PortfolioNavContactCtaIcon;
  className?: string;
}) {
  const Icon = CONTACT_CTA_ICON_RENDERERS[variant] ?? PhoneClassicIcon;
  return <Icon className={className} />;
}
