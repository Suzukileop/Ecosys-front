'use client';

import { localeTag } from '@/lib/i18n/active';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';

type MarketplaceCatalogPaginationProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  /** Plural noun shown in the summary, e.g. "products". */
  noun: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

type PageItem = number | 'gap-start' | 'gap-end';

function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const items: PageItem[] = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  if (start > 1) items.push('gap-start');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < total - 2) items.push('gap-end');
  items.push(total - 1);
  return items;
}

function scrollParentToTop(from: HTMLElement | null) {
  let node = from?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      node.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    node = node.parentElement;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const ARROW_BUTTON =
  'inline-flex h-10 w-10 items-center justify-center rounded-full text-[#536471] transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] disabled:pointer-events-none disabled:opacity-30 dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]';

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
      />
    </svg>
  );
}

function PageSizeMenu({
  value,
  options,
  onChange,
}: {
  value: number;
  options: readonly number[];
  onChange: (size: number) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 items-center gap-1.5 text-[14px] text-[#536471] transition-colors hover:text-[#0F1419] dark:text-[#71767B] dark:hover:text-[#E7E9EA]"
      >
        {t('Show')}
        <span className="font-semibold tabular-nums text-[#0F1419] dark:text-[#E7E9EA]">{value}</span>
        {t('per page')}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={t('Items per page')}
          className="absolute bottom-full right-0 z-20 mb-2 min-w-[7.5rem] overflow-hidden rounded-2xl bg-[#fff] py-1.5 shadow-[0_0_15px_rgba(101,119,134,0.2),0_0_3px_1px_rgba(101,119,134,0.15)] dark:bg-black dark:shadow-[0_0_15px_rgba(255,255,255,0.2),0_0_3px_1px_rgba(255,255,255,0.15)]"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setOpen(false);
                    if (!selected) onChange(option);
                  }}
                  className={`flex min-h-10 w-full items-center justify-between gap-4 px-4 py-2 text-left text-[15px] tabular-nums text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)] ${
                    selected ? 'font-bold' : 'font-medium'
                  }`}
                >
                  {option.toLocaleString(localeTag())}
                  {selected ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function MarketplaceCatalogPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions,
  noun,
  onPageChange,
  onPageSizeChange,
}: MarketplaceCatalogPaginationProps) {
  const t = useT();
  const rootRef = useRef<HTMLDivElement>(null);
  const pages = Math.max(1, totalPages);
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(totalElements, (page + 1) * pageSize);
  const progress = totalElements > 0 ? Math.min(100, (to / totalElements) * 100) : 0;
  const goTo = (next: number) => {
    if (next < 0 || next >= pages || next === page) return;
    onPageChange(next);
    scrollParentToTop(rootRef.current);
  };

  if (pages <= 1) {
    return (
      <div ref={rootRef} className="flex flex-col items-center gap-3 pt-8 text-center">
        <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#536471] dark:text-[#71767B]">
          {t('You’ve seen all {totalElements} {noun}', { totalElements, noun })}
        </p>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => scrollParentToTop(rootRef.current)}
            className="inline-flex h-10 items-center gap-1.5 text-[14px] font-semibold text-[#0F1419] underline-offset-4 hover:underline dark:text-[#E7E9EA]"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {t('Back to top')}
          </button>
          {totalElements > pageSizeOptions[0] || pageSize !== pageSizeOptions[0] ? (
            <PageSizeMenu value={pageSize} options={pageSizeOptions} onChange={onPageSizeChange} />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <nav
      ref={rootRef}
      aria-label={t('Pagination')}
      className="flex flex-col gap-6 pt-8 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-2.5">
        <p className="text-[14px] text-[#536471] dark:text-[#71767B]">
          {t('Showing')}{' '}
          <span className="font-semibold tabular-nums text-[#0F1419] dark:text-[#E7E9EA]">
            {from}–{to}
          </span>{' '}
          {t('of')} <span className="font-semibold tabular-nums text-[#0F1419] dark:text-[#E7E9EA]">{totalElements}</span> {noun}
        </p>
        <div className="h-[3px] w-40 overflow-hidden rounded-full bg-[#EFF3F4] dark:bg-[#2F3336]" aria-hidden>
          <div
            className="h-full rounded-full bg-[#0F1419] transition-[width] duration-500 ease-out dark:bg-[#E7E9EA]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t('Previous page')}
            disabled={page <= 0}
            onClick={() => goTo(page - 1)}
            className={ARROW_BUTTON}
          >
            <Chevron direction="left" />
          </button>
          {buildPageItems(page, pages).map((item) =>
            typeof item === 'number' ? (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item + 1}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => goTo(item)}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-2.5 text-[14px] tabular-nums transition-colors ${
                  item === page
                    ? 'bg-[#0F1419] font-bold text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]'
                    : 'text-[#536471] hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]'
                }`}
              >
                {item + 1}
              </button>
            ) : (
              <span key={item} aria-hidden className="w-6 text-center text-[14px] text-[#8B98A5] dark:text-[#536471]">
                …
              </span>
            )
          )}
          <button
            type="button"
            aria-label={t('Next page')}
            disabled={page >= pages - 1}
            onClick={() => goTo(page + 1)}
            className={ARROW_BUTTON}
          >
            <Chevron direction="right" />
          </button>
        </div>
        <PageSizeMenu value={pageSize} options={pageSizeOptions} onChange={onPageSizeChange} />
      </div>
    </nav>
  );
}
