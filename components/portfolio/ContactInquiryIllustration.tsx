'use client';

/**
 * Abstract support illustration for Contact « Inquiry split ».
 * Colors follow section CSS vars (--contact-accent / muted / ink).
 */
export function ContactInquiryIllustration({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[22rem] select-none ${className}`.trim()}
      aria-hidden
    >
      <svg viewBox="0 0 320 280" className="h-auto w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft accent wash */}
        <circle cx="168" cy="148" r="98" fill="var(--contact-accent-soft, rgba(234,88,12,0.14))" />
        {/* Dashed decorative rings */}
        <circle
          cx="168"
          cy="148"
          r="118"
          stroke="var(--contact-accent, #ea580c)"
          strokeWidth="1.25"
          strokeDasharray="4 7"
          opacity="0.35"
        />
        <circle
          cx="168"
          cy="148"
          r="132"
          stroke="var(--contact-muted, #737373)"
          strokeWidth="1"
          strokeDasharray="2 8"
          opacity="0.28"
        />

        {/* Desk */}
        <rect
          x="78"
          y="198"
          width="180"
          height="14"
          rx="4"
          fill="var(--contact-accent, #ea580c)"
          opacity="0.85"
        />
        <rect
          x="92"
          y="212"
          width="14"
          height="28"
          rx="2"
          fill="var(--contact-ink, #0a0a0a)"
          opacity="0.55"
        />
        <rect
          x="230"
          y="212"
          width="14"
          height="28"
          rx="2"
          fill="var(--contact-ink, #0a0a0a)"
          opacity="0.55"
        />

        {/* Chair back */}
        <path
          d="M118 148c0-28 18-48 46-48s46 20 46 48v50H118V148Z"
          fill="var(--contact-ink, #0a0a0a)"
          opacity="0.88"
        />
        {/* Torso / jacket */}
        <path
          d="M132 150c6-22 22-36 32-36s26 14 32 36v48H132V150Z"
          fill="var(--contact-ink, #0a0a0a)"
        />
        {/* Shirt / tie accent */}
        <path d="M156 120h16v62h-16V120Z" fill="var(--contact-accent, #ea580c)" opacity="0.9" />
        <path d="M160 122l4 28 4-28H160Z" fill="var(--contact-surface, #ffffff)" opacity="0.9" />

        {/* Head */}
        <circle cx="164" cy="96" r="22" fill="var(--contact-muted, #a3a3a3)" opacity="0.55" />
        <circle cx="164" cy="94" r="18" fill="#e8c4a8" />

        {/* Headset */}
        <path
          d="M142 92c0-14 10-24 22-24s22 10 22 24"
          stroke="var(--contact-accent, #ea580c)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.75"
        />
        <circle cx="140" cy="98" r="7" fill="var(--contact-accent, #ea580c)" opacity="0.8" />
        <circle cx="188" cy="98" r="7" fill="var(--contact-accent, #ea580c)" opacity="0.8" />
        <path
          d="M140 104v18c8 6 16 8 24 8"
          stroke="var(--contact-accent, #ea580c)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Laptop */}
        <rect
          x="148"
          y="168"
          width="72"
          height="42"
          rx="4"
          fill="var(--contact-muted, #737373)"
          opacity="0.45"
        />
        <rect x="154" y="174" width="60" height="30" rx="2" fill="var(--contact-surface, #ffffff)" />
        <circle cx="184" cy="189" r="5" fill="var(--contact-accent, #ea580c)" opacity="0.7" />
        <rect
          x="140"
          y="210"
          width="88"
          height="6"
          rx="2"
          fill="var(--contact-ink, #0a0a0a)"
          opacity="0.35"
        />

        {/* Speech bubble */}
        <g transform="translate(214 48)">
          <rect
            width="72"
            height="44"
            rx="14"
            fill="var(--contact-accent, #ea580c)"
          />
          <path d="M22 44l8 14 4-14H22Z" fill="var(--contact-accent, #ea580c)" />
          <circle cx="22" cy="22" r="4" fill="var(--contact-surface, #ffffff)" />
          <circle cx="36" cy="22" r="4" fill="var(--contact-surface, #ffffff)" />
          <circle cx="50" cy="22" r="4" fill="var(--contact-surface, #ffffff)" />
        </g>
      </svg>
    </div>
  );
}
