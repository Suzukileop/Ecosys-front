import Image from 'next/image';
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

/**
 * A video placeholder: the frame, a play glyph and a caption saying what goes there. Every slot
 * carries `data-video-slot="<name>"` — search the code for `data-video-slot` (or `VideoSlot`) to
 * find each one and swap in the real <video>. `tone` follows the section's background.
 */
export function VideoSlot({
  slot,
  label,
  ratio = 'aspect-video',
  tone = 'light',
  className = '',
}: {
  slot: string;
  label: string;
  ratio?: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <div
      data-video-slot={slot}
      role="img"
      aria-label={label}
      className={`relative flex ${ratio} w-full items-center justify-center overflow-hidden rounded-2xl ${
        dark
          ? 'bg-[linear-gradient(160deg,#1c1c1c,#0f0f0f)] ring-1 ring-inset ring-white/10'
          : 'bg-[linear-gradient(160deg,#f4f4f4,#e9e9e9)] ring-1 ring-inset ring-black/[0.06]'
      } ${className}`}
    >
      {/* A faint page skeleton, so the empty frame still reads as "the product goes here". */}
      <span aria-hidden className={`absolute inset-x-[8%] top-[9%] flex items-center gap-2 ${dark ? 'opacity-25' : 'opacity-40'}`}>
        <span className={`h-2 w-2 rounded-full ${dark ? 'bg-white' : 'bg-black/40'}`} />
        <span className={`h-2 w-2 rounded-full ${dark ? 'bg-white' : 'bg-black/40'}`} />
        <span className={`h-2 w-2 rounded-full ${dark ? 'bg-white' : 'bg-black/40'}`} />
        <span className={`ml-3 h-2 flex-1 rounded-full ${dark ? 'bg-white/60' : 'bg-black/15'}`} />
      </span>
      <span
        aria-hidden
        className={`relative inline-flex h-16 w-16 items-center justify-center rounded-full shadow-[0_12px_32px_-10px_rgba(0,0,0,0.5)] sm:h-20 sm:w-20 ${
          dark ? 'bg-white text-[#111111]' : 'bg-[#111111] text-white'
        }`}
      >
        <svg className="ml-1 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.5v13l10.5-6.5L8 5.5z" />
        </svg>
      </span>
      <span
        className={`absolute bottom-4 left-4 right-4 truncate text-center text-[12px] font-medium sm:bottom-5 sm:text-[13px] ${
          dark ? 'text-white/50' : 'text-black/45'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * An image frame for galleries: shows `src` when given, otherwise an empty frame with an image
 * glyph. Every frame carries `data-image-slot="<name>"`; pass `src` (a file in /public) to fill it.
 * `children` render on top of the image (captions, badges).
 */
export function ImageSlot({
  slot,
  alt,
  src,
  ratio = 'aspect-[4/3]',
  tone = 'light',
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  className = '',
  children,
}: {
  slot: string;
  alt: string;
  src?: string;
  ratio?: string;
  tone?: 'light' | 'dark';
  sizes?: string;
  className?: string;
  children?: ReactNode;
}) {
  const dark = tone === 'dark';
  return (
    <div
      data-image-slot={slot}
      className={`group relative ${ratio} w-full overflow-hidden rounded-2xl ${
        dark
          ? 'bg-[linear-gradient(160deg,#1c1c1c,#0f0f0f)] ring-1 ring-inset ring-white/10'
          : 'bg-[linear-gradient(160deg,#f4f4f4,#e9e9e9)] ring-1 ring-inset ring-black/[0.06]'
      } ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div role="img" aria-label={alt} className="absolute inset-0 flex items-center justify-center">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className={`h-10 w-10 ${dark ? 'text-white/20' : 'text-black/20'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <circle cx="9" cy="9.5" r="1.75" />
            <path d="m21 16-5-5-9 9" />
          </svg>
        </div>
      )}
      {children}
    </div>
  );
}

/** A small check in the brand orange, for reassurance lines and benefit lists. */
export function CheckDot({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF5722] text-white ${className}`}
    >
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
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
      className={`inline-flex h-12 w-fit items-center gap-3 rounded-full pl-6 pr-2 text-[15px] font-medium ${tone} ${className}`}
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
