'use client';

import type { PortfolioFaqIllustrationVariant } from '@/components/portfolio/portfolio-faq-settings';

/**
 * Decorative FAQ illustrations — colors follow section CSS vars
 * (--faq-accent / muted / ink) via currentColor + fill vars.
 */
export function FaqSectionIllustration({
  variant,
  className = '',
}: {
  variant: Exclude<PortfolioFaqIllustrationVariant, 'none'>;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[18rem] select-none lg:max-w-[20rem] ${className}`.trim()}
      aria-hidden
      style={{ color: 'var(--faq-accent, #f97316)' }}
    >
      {variant === 'chat' ? <FaqSvgChat /> : null}
      {variant === 'question' ? <FaqSvgQuestion /> : null}
      {variant === 'docs' ? <FaqSvgDocs /> : null}
      {variant === 'support' ? <FaqSvgSupport /> : null}
      {variant === 'hex' ? <FaqSvgHex /> : null}
    </div>
  );
}

function FaqSvgChat() {
  return (
    <svg viewBox="0 0 280 260" className="h-auto w-full" fill="none">
      <circle cx="140" cy="130" r="100" fill="currentColor" opacity="0.1" />
      <rect x="48" y="70" width="120" height="72" rx="18" fill="currentColor" opacity="0.9" />
      <path d="M72 142l-10 22 28-14" fill="currentColor" opacity="0.9" />
      <circle cx="78" cy="106" r="5" fill="var(--faq-surface, #fff)" />
      <circle cx="98" cy="106" r="5" fill="var(--faq-surface, #fff)" />
      <circle cx="118" cy="106" r="5" fill="var(--faq-surface, #fff)" />
      <rect
        x="118"
        y="128"
        width="110"
        height="64"
        rx="16"
        fill="var(--faq-ink, #0a0a0a)"
        opacity="0.75"
      />
      <path d="M200 192l18 18 4-22" fill="var(--faq-ink, #0a0a0a)" opacity="0.75" />
      <rect x="138" y="148" width="54" height="6" rx="3" fill="var(--faq-surface, #fff)" opacity="0.85" />
      <rect x="138" y="164" width="70" height="6" rx="3" fill="var(--faq-surface, #fff)" opacity="0.55" />
    </svg>
  );
}

function FaqSvgQuestion() {
  return (
    <svg viewBox="0 0 280 260" className="h-auto w-full" fill="none">
      <circle cx="140" cy="130" r="108" stroke="currentColor" strokeWidth="1.25" strokeDasharray="5 8" opacity="0.35" />
      <circle cx="140" cy="130" r="82" fill="currentColor" opacity="0.12" />
      <circle cx="140" cy="130" r="64" fill="currentColor" opacity="0.88" />
      <path
        d="M118 112c0-14 10-24 22-24s22 9 22 22c0 10-6 16-14 20-6 3-8 6-8 12"
        stroke="var(--faq-surface, #fff)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="140" cy="168" r="6" fill="var(--faq-surface, #fff)" />
    </svg>
  );
}

function FaqSvgDocs() {
  return (
    <svg viewBox="0 0 280 260" className="h-auto w-full" fill="none">
      <circle cx="148" cy="140" r="96" fill="currentColor" opacity="0.1" />
      <rect x="88" y="56" width="110" height="140" rx="12" fill="var(--faq-ink, #0a0a0a)" opacity="0.35" />
      <rect x="78" y="66" width="110" height="140" rx="12" fill="var(--faq-ink, #0a0a0a)" opacity="0.55" />
      <rect x="68" y="76" width="110" height="140" rx="12" fill="currentColor" />
      <rect x="86" y="104" width="74" height="8" rx="4" fill="var(--faq-surface, #fff)" opacity="0.95" />
      <rect x="86" y="124" width="58" height="7" rx="3.5" fill="var(--faq-surface, #fff)" opacity="0.55" />
      <rect x="86" y="142" width="66" height="7" rx="3.5" fill="var(--faq-surface, #fff)" opacity="0.45" />
      <rect x="86" y="160" width="50" height="7" rx="3.5" fill="var(--faq-surface, #fff)" opacity="0.35" />
      <circle cx="196" cy="88" r="28" fill="var(--faq-ink, #0a0a0a)" opacity="0.85" />
      <path
        d="M196 76v16M188 92h16"
        stroke="var(--faq-surface, #fff)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FaqSvgSupport() {
  return (
    <svg viewBox="0 0 280 260" className="h-auto w-full" fill="none">
      <circle cx="140" cy="132" r="100" fill="currentColor" opacity="0.1" />
      <path
        d="M92 128c0-28 20-50 48-50s48 22 48 50"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="88" cy="136" r="14" fill="currentColor" />
      <circle cx="192" cy="136" r="14" fill="currentColor" />
      <path d="M88 148v22c12 16 28 24 52 24s40-8 52-24v-22" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
      <circle cx="140" cy="108" r="28" fill="var(--faq-ink, #0a0a0a)" opacity="0.55" />
      <circle cx="140" cy="104" r="22" fill="#e8c4a8" />
      <rect x="108" y="188" width="64" height="28" rx="10" fill="currentColor" opacity="0.9" />
      <circle cx="124" cy="202" r="3.5" fill="var(--faq-surface, #fff)" />
      <circle cx="140" cy="202" r="3.5" fill="var(--faq-surface, #fff)" />
      <circle cx="156" cy="202" r="3.5" fill="var(--faq-surface, #fff)" />
    </svg>
  );
}

function FaqSvgHex() {
  return (
    <svg viewBox="0 0 280 260" className="h-auto w-full" fill="none">
      <path
        d="M140 28l86 50v100l-86 50-86-50V78l86-50Z"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
      <path
        d="M140 58l58 34v68l-58 34-58-34V92l58-34Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.45"
      />
      <path d="M140 78l38 22v44l-38 22-38-22v-44l38-22Z" fill="currentColor" opacity="0.88" />
      <path
        d="M128 118h24M140 106v28"
        stroke="var(--faq-surface, #fff)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="140" cy="148" r="4.5" fill="var(--faq-surface, #fff)" />
      <circle cx="72" cy="70" r="6" fill="currentColor" opacity="0.5" />
      <circle cx="214" cy="188" r="8" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
