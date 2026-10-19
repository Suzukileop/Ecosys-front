'use client';

import { useEffect, useRef, useState } from 'react';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { useT } from '@/lib/i18n/I18nProvider';

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9.5l6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

type MarketplaceFilterDropdownProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Value treated as "no filter": hides the value chip and the clear button. */
  defaultValue?: string;
  clearable?: boolean;
  size?: 'md' | 'sm';
  align?: 'left' | 'right';
  placement?: 'bottom' | 'top';
  /** Below `sm`, share the row with its siblings (equal-width, centered label). */
  stretch?: boolean;
  /** `plain`: a text trigger (no pill) for underline tab bars, and a panel framed by one hairline
   *  instead of the glow ring. */
  appearance?: 'pill' | 'plain';
};

/** Hairline trigger ("Label · Value") with a floating listbox; keyboard: arrows, Enter, Escape. */
export function MarketplaceFilterDropdown({
  id,
  label,
  value,
  onChange,
  options,
  defaultValue = '',
  clearable = true,
  size = 'md',
  align = 'left',
  placement = 'bottom',
  stretch = false,
  appearance = 'pill',
}: MarketplaceFilterDropdownProps) {
  const t = useT();
  const plain = appearance === 'plain';
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const current = options.find((option) => option.value === value);
  const active = Boolean(current) && value !== defaultValue;

  const openMenu = () => {
    setCursor(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor, open]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((prev) => Math.min(prev + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = options[cursor];
      if (option) pick(option.value);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 ${stretch ? 'flex-1 sm:flex-none' : 'shrink-0'}`}
      onKeyDown={onKeyDown}
    >
      <div
        className={`group/sel items-center ${
          plain
            ? 'rounded-md has-[:focus-visible]:shadow-[0_0_0_2px_var(--gn-ink)]'
            : 'rounded-full bg-[#EFF3F4] transition-colors duration-200 hover:bg-[#E1E8ED] has-[:focus-visible]:shadow-[inset_0_0_0_2px_var(--gn-ink)] dark:bg-[#202327] dark:hover:bg-[#2A2E33]'
        } ${size === 'sm' ? 'h-10' : 'h-11'} ${stretch ? 'flex w-full sm:inline-flex sm:w-auto' : 'inline-flex'}`}
      >
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openMenu())}
          className={`inline-flex h-full items-center gap-2 outline-hidden ${
            plain ? 'text-[15px]' : `text-[14px] ${size === 'sm' ? 'pl-3.5 pr-3' : 'pl-4 pr-3.5'}`
          } ${stretch ? 'min-w-0 flex-1 justify-center sm:flex-none sm:justify-start' : ''}`}
        >
          <span className={active ? 'text-[#536471] dark:text-[#71767B]' : 'font-semibold text-[#0F1419] dark:text-[#E7E9EA]'}>
            {label}
          </span>
          {active && current ? (
            <span className="max-w-[11rem] truncate font-semibold text-[#0F1419] dark:text-[#E7E9EA]">{t(current.label)}</span>
          ) : null}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#536471] transition-transform duration-300 dark:text-[#71767B] ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {active && clearable ? (
          <button
            type="button"
            aria-label={t('Clear {toLowerCase}', { toLowerCase: label.toLowerCase() })}
            title={t('Clear')}
            onClick={() => onChange(defaultValue)}
            className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#536471] transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]"
          >
            <XIcon className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className={`absolute z-50 w-64 overflow-hidden rounded-2xl bg-white dark:bg-black ${
            plain
              ? 'shadow-[0_0_0_1px_#E1E8ED,0_8px_20px_-14px_rgba(15,20,25,0.18)] dark:shadow-[0_0_0_1px_#2F3336]'
              : 'shadow-[0_0_15px_rgba(101,119,134,0.2),0_0_3px_1px_rgba(101,119,134,0.15)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2),0_0_3px_1px_rgba(255,255,255,0.15)]'
          } ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          style={STUDIO_FLOAT_IN_STYLE}
        >
          <ul
            ref={listRef}
            role="listbox"
            aria-labelledby={id}
            // Tall enough that short lists (Sort: 7 options) never scroll. Long ones (Genre) get a slim
            // rounded thumb, no arrow buttons; Chromium ignores ::-webkit-scrollbar once the standard
            // scrollbar-width is set, so only the -webkit- styling is used here.
            className="max-h-[min(24rem,60vh)] overflow-y-auto overscroll-contain py-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 dark:[&::-webkit-scrollbar-thumb]:bg-white/20"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value || 'any'} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => pick(option.value)}
                    className={`flex min-h-10 w-full items-center justify-between gap-3 px-4 py-2 text-left text-[15px] text-[#0F1419] transition-colors duration-150 dark:text-[#E7E9EA] ${
                      index === cursor ? 'bg-[rgba(15,20,25,0.06)] dark:bg-[rgba(231,233,234,0.1)]' : ''
                    } ${isSelected ? 'font-bold' : 'font-medium'}`}
                  >
                    <span className="truncate">{t(option.label)}</span>
                    {isSelected ? <CheckIcon className="h-4 w-4 shrink-0 text-[#0F1419] dark:text-[#E7E9EA]" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
