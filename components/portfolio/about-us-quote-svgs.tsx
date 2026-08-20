'use client';

export const ABOUT_US_QUOTE_SVG_IDS = ['globe', 'team', 'handshake', 'spark'] as const;

export type AboutUsQuoteSvgId = (typeof ABOUT_US_QUOTE_SVG_IDS)[number];

export const DEFAULT_ABOUT_US_QUOTE_SVG_IDS: [
  AboutUsQuoteSvgId,
  AboutUsQuoteSvgId,
  AboutUsQuoteSvgId,
  AboutUsQuoteSvgId,
] = ['globe', 'team', 'handshake', 'spark'];

export const DEFAULT_ABOUT_US_QUOTE_SVG_URLS: [string, string, string, string] = ['', '', '', ''];

export const PORTFOLIO_ABOUT_US_QUOTE_SVG_OPTIONS: {
  value: AboutUsQuoteSvgId;
  label: string;
}[] = [
  { value: 'globe', label: 'Globe' },
  { value: 'team', label: 'Équipe' },
  { value: 'handshake', label: 'Partenaires' },
  { value: 'spark', label: 'Élan' },
];

export function isAboutUsQuoteSvgId(value: unknown): value is AboutUsQuoteSvgId {
  return value === 'globe' || value === 'team' || value === 'handshake' || value === 'spark';
}

export function quoteSvgSlotIndex(id: AboutUsQuoteSvgId): 0 | 1 | 2 | 3 {
  const index = ABOUT_US_QUOTE_SVG_IDS.indexOf(id);
  return (index >= 0 ? index : 0) as 0 | 1 | 2 | 3;
}

export function AboutUsQuoteSvg({
  id,
  className = '',
}: {
  id: AboutUsQuoteSvgId;
  className?: string;
}) {
  const frame = `h-full w-full ${className}`.trim();
  if (id === 'team') return <QuoteSvgTeam className={frame} />;
  if (id === 'handshake') return <QuoteSvgHandshake className={frame} />;
  if (id === 'spark') return <QuoteSvgSpark className={frame} />;
  return <QuoteSvgGlobe className={frame} />;
}

function QuoteSvgGlobe({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" aria-hidden>
      <circle cx="80" cy="80" r="62" fill="currentColor" opacity="0.12" />
      <circle cx="80" cy="80" r="46" stroke="currentColor" strokeWidth="2.4" opacity="0.95" />
      <ellipse cx="80" cy="80" rx="18" ry="46" stroke="currentColor" strokeWidth="1.8" opacity="0.7" />
      <path
        d="M36 80h88M42 58h76M42 102h76"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="112" cy="52" r="11" fill="var(--about-us-ink, currentColor)" />
      <circle cx="112" cy="52" r="4.5" fill="var(--about-us-surface, #fff)" />
    </svg>
  );
}

function QuoteSvgTeam({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" aria-hidden>
      <circle cx="80" cy="80" r="62" fill="currentColor" opacity="0.1" />
      <circle cx="56" cy="62" r="16" fill="currentColor" opacity="0.88" />
      <path d="M28 108c2-18 14-28 28-28s26 10 28 28" fill="currentColor" opacity="0.88" />
      <circle cx="104" cy="58" r="16" fill="var(--about-us-ink, currentColor)" opacity="0.82" />
      <path
        d="M78 108c2-18 14-28 26-28s26 10 28 28"
        fill="var(--about-us-ink, currentColor)"
        opacity="0.82"
      />
      <circle cx="80" cy="86" r="13" fill="var(--about-us-surface, #fff)" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

function QuoteSvgHandshake({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" aria-hidden>
      <circle cx="80" cy="80" r="62" fill="currentColor" opacity="0.1" />
      <path
        d="M28 78c18-6 32-4 44 8l8 8c4 4 12 4 16 0l6-6c6-6 16-8 28-4"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M34 86h28l14 14c5 5 14 5 19 0l11-11h20"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M68 100l8 8c3 3 8 3 11 0"
        stroke="var(--about-us-ink, currentColor)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="48" cy="58" r="6" fill="currentColor" opacity="0.55" />
      <circle cx="116" cy="54" r="8" fill="var(--about-us-ink, currentColor)" opacity="0.7" />
    </svg>
  );
}

function QuoteSvgSpark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" aria-hidden>
      <circle cx="80" cy="80" r="62" fill="currentColor" opacity="0.1" />
      <path
        d="M80 28l10 32 34 6-26 22 8 34-26-18-26 18 8-34-26-22 34-6 10-32Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M80 54l5 16 17 3-13 11 4 17-13-9-13 9 4-17-13-11 17-3 5-16Z"
        fill="var(--about-us-surface, #fff)"
        opacity="0.92"
      />
      <circle cx="124" cy="118" r="7" fill="var(--about-us-ink, currentColor)" opacity="0.75" />
      <circle cx="36" cy="46" r="5" fill="currentColor" opacity="0.45" />
    </svg>
  );
}
