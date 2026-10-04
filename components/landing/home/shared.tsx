import Link from 'next/link';
import type { ReactNode } from 'react';

export const CONTAINER = 'mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-14';

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-neutral-500 ${className}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#FF5722]" />
      {children}
    </p>
  );
}

export function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Ink pill CTA with a trailing arrow. */
export function PrimaryCta({
  href,
  children,
  inverted = false,
  className = '',
}: {
  href: string;
  children: ReactNode;
  inverted?: boolean;
  className?: string;
}) {
  const tone = inverted ? 'bg-white text-[#111111] hover:bg-neutral-100' : 'bg-[#111111] text-white hover:bg-black';
  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-2 text-[15px] font-medium ${tone} ${className}`}
    >
      {children}
      <span
        className={`inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ${
          inverted ? 'bg-[#111111] text-white' : 'bg-white/15'
        }`}
      >
        <ArrowIcon />
      </span>
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  className = '',
}: {
  eyebrow: string;
  title: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-6 max-w-3xl text-[clamp(2.25rem,5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[#111111]">
        {title}
      </h2>
    </div>
  );
}
