'use client';

import type { ReactNode } from 'react';

export type PortfolioWorkCtaIcon =
  | 'arrow-up-right'
  | 'arrow-right'
  | 'external-link'
  | 'chevron-right'
  | 'play'
  | 'plus'
  | 'corner-up-right'
  | 'sparkle';

export type PortfolioWorkCtaIconPosition = 'left' | 'right';

const WORK_CTA_ICON_VALUES: PortfolioWorkCtaIcon[] = [
  'arrow-up-right',
  'arrow-right',
  'external-link',
  'chevron-right',
  'play',
  'plus',
  'corner-up-right',
  'sparkle',
];

export const PORTFOLIO_WORK_CTA_ICON_OPTIONS: {
  value: PortfolioWorkCtaIcon;
  label: string;
  description: string;
}[] = [
  {
    value: 'arrow-up-right',
    label: 'Arrow up-right',
    description: 'Classic external / open arrow (default).',
  },
  {
    value: 'arrow-right',
    label: 'Arrow right',
    description: 'Simple forward arrow.',
  },
  {
    value: 'external-link',
    label: 'External link',
    description: 'Box with corner arrow — opens elsewhere.',
  },
  {
    value: 'chevron-right',
    label: 'Chevron',
    description: 'Minimal chevron — soft forward cue.',
  },
  {
    value: 'play',
    label: 'Play',
    description: 'Triangle play mark — good for video work.',
  },
  {
    value: 'plus',
    label: 'Plus',
    description: 'Plus sign — discover / add feel.',
  },
  {
    value: 'corner-up-right',
    label: 'Corner arrow',
    description: 'Bent arrow — continue / next step.',
  },
  {
    value: 'sparkle',
    label: 'Sparkle',
    description: 'Four-point spark — featured / new.',
  },
];

export const PORTFOLIO_WORK_CTA_ICON_POSITION_OPTIONS: {
  value: PortfolioWorkCtaIconPosition;
  label: string;
  description: string;
}[] = [
  {
    value: 'right',
    label: 'Right',
    description: 'Icon after the label.',
  },
  {
    value: 'left',
    label: 'Left',
    description: 'Icon before the label.',
  },
];

export function normalizePortfolioWorkCtaIcon(
  value: unknown,
  fallback: PortfolioWorkCtaIcon = 'arrow-up-right'
): PortfolioWorkCtaIcon {
  if (typeof value === 'string' && WORK_CTA_ICON_VALUES.includes(value as PortfolioWorkCtaIcon)) {
    return value as PortfolioWorkCtaIcon;
  }
  return fallback;
}

function WorkCtaSvg({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <WorkCtaSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
    </WorkCtaSvg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <WorkCtaSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </WorkCtaSvg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <WorkCtaSvg className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 5h5v5M10 14L19 5M19 14v4a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h4"
      />
    </WorkCtaSvg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <WorkCtaSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </WorkCtaSvg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <WorkCtaSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6.5v11l9-5.5-9-5.5z" />
    </WorkCtaSvg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <WorkCtaSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </WorkCtaSvg>
  );
}

function CornerUpRightIcon({ className }: { className?: string }) {
  return (
    <WorkCtaSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18V9a3 3 0 013-3h9M15 3l3 3-3 3" />
    </WorkCtaSvg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <WorkCtaSvg className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5l1.2 4.3L17.5 9 13.2 10.2 12 14.5l-1.2-4.3L6.5 9l4.3-1.2L12 3.5zM18.5 14l.7 2.3L21.5 17l-2.3.7-.7 2.3-.7-2.3L15.5 17l2.3-.7.7-2.3z"
      />
    </WorkCtaSvg>
  );
}

const WORK_CTA_ICON_RENDERERS: Record<
  PortfolioWorkCtaIcon,
  (props: { className?: string }) => ReactNode
> = {
  'arrow-up-right': ArrowUpRightIcon,
  'arrow-right': ArrowRightIcon,
  'external-link': ExternalLinkIcon,
  'chevron-right': ChevronRightIcon,
  play: PlayIcon,
  plus: PlusIcon,
  'corner-up-right': CornerUpRightIcon,
  sparkle: SparkleIcon,
};

export function PortfolioWorkCtaGlyph({
  variant = 'arrow-up-right',
  className = 'h-4 w-4',
}: {
  variant?: PortfolioWorkCtaIcon;
  className?: string;
}) {
  const Icon = WORK_CTA_ICON_RENDERERS[variant] ?? ArrowUpRightIcon;
  return <Icon className={className} />;
}
