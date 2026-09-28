'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  CONTACT_VISIBILITY_OPTIONS,
  type ContactVisibilityLevel,
} from '@/lib/contact-visibility';
import { STUDIO_ICON_BUTTON_TONES } from '@/components/portfolio/PortfolioStudioKit';

export const portfolioInlineInputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] font-semibold text-neutral-900 outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white';

export const portfolioInlineInputErrorClass =
  'w-full rounded-lg border border-red-400 bg-white px-3 py-2 text-[15px] font-semibold text-neutral-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500/70 dark:bg-neutral-900 dark:text-white';

export const portfolioFieldErrorTextClass = 'mt-1 text-xs font-medium text-red-600 dark:text-red-400';

export function PortfolioSectionIconButton({
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

/** Flat bullet row matching Why choose me list pattern. */
export function PortfolioBulletRow({
  children,
  actions,
  editing = false,
  editControl,
}: {
  children: ReactNode;
  actions?: ReactNode;
  editing?: boolean;
  editControl?: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 border-b border-black/[0.06] py-4 dark:border-white/[0.06]">
      <span
        className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-[#FF5722]"
        aria-hidden
      />
      <div className="min-w-0 flex-1">{editing ? editControl : children}</div>
      {actions ? (
        <div className="inline-flex h-8 shrink-0 items-center gap-1.5 self-center">{actions}</div>
      ) : null}
    </li>
  );
}

export function PortfolioRowConfirmActions({
  canConfirm,
  confirming,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  emptyRemoves = false,
  isEmpty = false,
}: {
  canConfirm: boolean;
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  emptyRemoves?: boolean;
  isEmpty?: boolean;
}) {
  const enabled = emptyRemoves && isEmpty ? true : canConfirm;
  return (
    <>
      <PortfolioSectionIconButton
        label={isEmpty && emptyRemoves ? 'Remove empty item' : canConfirm ? confirmLabel : 'No changes'}
        tone={enabled && !(isEmpty && emptyRemoves && !canConfirm) && canConfirm ? 'confirm' : 'neutral'}
        disabled={confirming || (!enabled && !(emptyRemoves && isEmpty))}
        onClick={onConfirm}
      >
        {confirming ? (
          <LoadingSpinner size="sm" />
        ) : (
          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
        )}
      </PortfolioSectionIconButton>
      <PortfolioSectionIconButton label="Cancel" tone="cancel" disabled={confirming} onClick={onCancel}>
        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
      </PortfolioSectionIconButton>
    </>
  );
}

export function PortfolioRowEditButton({ onClick, label = 'Edit' }: { onClick: () => void; label?: string }) {
  return (
    <PortfolioSectionIconButton label={label} onClick={onClick}>
      <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
    </PortfolioSectionIconButton>
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
  'reputation',
] as const;

/** Numbered tabs to switch between list entries (one visible at a time). */
export function PortfolioEntryPager({
  count,
  activeIndex,
  onSelect,
  disabled = false,
  label = 'Entries',
  addAction,
  align = 'center',
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
  label?: string;
  addAction?: ReactNode;
  align?: 'center' | 'end';
}) {
  if (count <= 0 && !addAction) return null;

  const alignClass = align === 'end' ? 'items-end' : 'items-center';
  const tabsAlignClass = align === 'end' ? 'justify-end' : 'justify-center';

  return (
    <div className={`flex flex-col gap-2 py-1 ${alignClass}`}>
      {count > 0 ? (
        <div
          className={`flex flex-wrap items-center gap-1.5 ${tabsAlignClass}`}
          role="tablist"
          aria-label={label}
        >
          {Array.from({ length: count }, (_, slot) => {
            const selected = slot === activeIndex;
            return (
              <button
                key={slot}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`${label} ${slot + 1}`}
                disabled={disabled}
                onClick={() => {
                  if (slot !== activeIndex) onSelect(slot);
                }}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2.5 text-[14px] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  selected
                    ? 'border-black bg-black font-semibold text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-neutral-300 bg-white font-normal text-neutral-700 hover:border-neutral-900 hover:text-black dark:border-white/25 dark:bg-transparent dark:text-white/80 dark:hover:border-white dark:hover:text-white'
                }`}
              >
                {slot + 1}
              </button>
            );
          })}
        </div>
      ) : null}
      {addAction ? <div className={`flex ${align === 'end' ? 'justify-end' : 'justify-center'}`}>{addAction}</div> : null}
    </div>
  );
}
