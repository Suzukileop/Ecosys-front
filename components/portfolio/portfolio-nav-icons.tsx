'use client';

import type { ReactNode } from 'react';
import type {
  PortfolioNavIconVariant,
  PortfolioNavSectionKey,
} from '@/components/portfolio/portfolio-nav-items';

function NavIconBase({ className, children }: { className?: string; children: ReactNode }) {
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

function HomeIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 11.5L12 4l8 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10.5V19a1 1 0 001 1h3.5v-5h2v5H16.5a1 1 0 001-1v-8.5" />
    </NavIconBase>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </NavIconBase>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path strokeLinecap="round" d="M9 8V6a3 3 0 016 0v2" />
      <path strokeLinecap="round" d="M3 13h18" />
    </NavIconBase>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 17l4.5-4.5 3 3L14 14l4 4" />
    </NavIconBase>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5L12 14.8 7.5 16.7l.9-5L4.8 8.2l5-.7L12 3z"
      />
    </NavIconBase>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l1.5 1.5M14.5 14.5L16 16M16 8l-1.5 1.5M8 16l1.5-1.5" />
      <circle cx="12" cy="12" r="2.25" />
    </NavIconBase>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.7 6.3a4.5 4.5 0 00-6.1 6.1L4 17l3 3 4.6-4.6a4.5 4.5 0 006.1-6.1l-2.2 2.2-1.8-1.8 2.2-2.2z"
      />
    </NavIconBase>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-1a6 6 0 0112 0v1" />
    </NavIconBase>
  );
}

function IdCardIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9.5" cy="11" r="2" />
      <path strokeLinecap="round" d="M14 10h4M14 14h4M6 16h3" />
    </NavIconBase>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20s-6.5-4.2-8.5-8.2C1.8 8.4 4.2 5 7.6 5c1.8 0 3.2.9 4.4 2.1C13.2 5.9 14.6 5 16.4 5 19.8 5 22.2 8.4 20.5 11.8 18.5 15.8 12 20 12 20z"
      />
    </NavIconBase>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M9.5 9.25a2.75 2.75 0 014.5 2.1c0 1.65-2.25 2.15-2.25 3.65" />
      <circle cx="12" cy="17.25" r="0.75" fill="currentColor" stroke="none" />
    </NavIconBase>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 6.5h14a2 2 0 012 2v6a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
    </NavIconBase>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path strokeLinecap="round" d="M8 7h12M8 12h12M8 17h12" />
      <circle cx="4.5" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="17" r="1" fill="currentColor" stroke="none" />
    </NavIconBase>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5l8 5 8-5" />
      <rect x="4" y="5" width="16" height="14" rx="2" />
    </NavIconBase>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l16-7-7 16-2-7-7-2z" />
    </NavIconBase>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <NavIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 5.2c.4-1 1.5-1.3 2.3-.6l1.4 1.1c.7.6.8 1.6.3 2.3l-.8 1.1a11.5 11.5 0 005.6 5.6l1.1-.8c.7-.5 1.7-.4 2.3.3l1.1 1.4c.7.8.4 1.9-.6 2.3-1 .4-2.1.6-3.2.6a11 11 0 01-11-11c0-1.1.2-2.2.6-3.2z"
      />
    </NavIconBase>
  );
}

const ICON_RENDERERS: Record<PortfolioNavIconVariant, (props: { className?: string }) => ReactNode> = {
  home: HomeIcon,
  grid: GridIcon,
  briefcase: BriefcaseIcon,
  image: ImageIcon,
  star: StarIcon,
  sparkles: SparklesIcon,
  wrench: WrenchIcon,
  user: UserIcon,
  'id-card': IdCardIcon,
  heart: HeartIcon,
  'help-circle': HelpCircleIcon,
  message: MessageIcon,
  list: ListIcon,
  mail: MailIcon,
  send: SendIcon,
  phone: PhoneIcon,
};

export function PortfolioNavIcon({
  variant,
  className = 'h-5 w-5',
}: {
  variant: PortfolioNavIconVariant;
  className?: string;
}) {
  const Icon = ICON_RENDERERS[variant];
  if (!Icon) {
    return (
      <NavIconBase className={className}>
        <circle cx="12" cy="12" r="3" />
      </NavIconBase>
    );
  }
  return <Icon className={className} />;
}

/** @deprecated Use PortfolioNavIcon with an explicit variant. */
export function PortfolioNavSectionIcon({
  id,
  className = 'h-5 w-5',
}: {
  id: PortfolioNavSectionKey | string;
  className?: string;
}) {
  const legacyMap: Partial<Record<string, PortfolioNavIconVariant>> = {
    work: 'grid',
    services: 'star',
    about: 'user',
    experience: 'briefcase',
    faq: 'help-circle',
    contact: 'mail',
  };
  return <PortfolioNavIcon variant={legacyMap[id] ?? 'grid'} className={className} />;
}
