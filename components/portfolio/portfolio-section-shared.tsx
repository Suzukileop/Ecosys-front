'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import {
  CONTACT_VISIBILITY_OPTIONS,
  type ContactVisibilityLevel,
} from '@/lib/contact-visibility';
import { STUDIO_ICON_BUTTON_TONES } from '@/components/portfolio/PortfolioStudioKit';

export const portfolioInlineInputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] font-semibold text-neutral-900 outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white';

function PortfolioSectionIconButton({
  label,
  onClick,
  children,
  active = false,
  disabled = false,
  tone = 'neutral',
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  tone?: 'neutral' | 'confirm' | 'cancel' | 'danger';
}) {
  const toneClass = STUDIO_ICON_BUTTON_TONES[active && tone === 'neutral' ? 'active' : tone];

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${toneClass}`}
    >
      {children}
    </button>
  );
}

export function PortfolioSectionVisibilityMenu({
  value,
  onChange,
}: {
  value: ContactVisibilityLevel;
  onChange: (value: ContactVisibilityLevel) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const hidden = value === 'HIDDEN';
  const label = CONTACT_VISIBILITY_OPTIONS.find((option) => option.value === value)?.label ?? 'Public';

  return (
    <div ref={rootRef} className="relative inline-flex shrink-0 items-center">
      <PortfolioSectionIconButton
        label={`Visibility: ${label}`}
        active={open || hidden}
        onClick={() => setOpen((prev) => !prev)}
      >
        <FontAwesomeIcon icon={hidden ? faEyeSlash : faEye} className="h-3.5 w-3.5" fixedWidth />
      </PortfolioSectionIconButton>
      {open ? (
        <div className="absolute bottom-full right-0 z-20 mb-1.5 min-w-[9.5rem] overflow-hidden rounded-lg border border-black/[0.08] bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-[#141414]">
          {CONTACT_VISIBILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-left text-[14px] transition-colors ${
                option.value === value
                  ? 'font-semibold text-black dark:text-white'
                  : 'font-normal text-neutral-600 hover:bg-black/[0.03] hover:text-black dark:text-neutral-300 dark:hover:bg-white/[0.04] dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const PORTFOLIO_CHROME_SECTIONS = [
  'about',
  'aboutPage',
  'experience',
  'strengths',
  'tools',
  'services',
  'products',
  'portfolio',
  'faq',
  'team',
  'gallery',
  'aboutUs',
  'links',
  'contact',
] as const;
