'use client';

import { useEffect, useRef, useState } from 'react';

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
  'inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-[#111111] disabled:pointer-events-none disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white';

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
        className="inline-flex items-center gap-1.5 text-[14px] text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
      >
        Show
        <span className="font-semibold tabular-nums text-[#111111] dark:text-white">{value}</span>
        per page
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
          aria-label="Items per page"
          className="absolute bottom-full right-0 z-20 mb-2 min-w-[7.5rem] overflow-hidden rounded-lg border border-black/[0.08] bg-white p-1 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] dark:border-white/[0.1] dark:bg-[#161616]"
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
                  className={`flex w-full items-center justify-between gap-4 rounded-md px-3 py-2 text-left text-[14px] tabular-nums transition-colors ${
                    selected
                      ? 'font-semibold text-[#111111] dark:text-white'
                      : 'text-neutral-600 hover:bg-black/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  {option.toLocaleString('en-US')}
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
      <div ref={rootRef} className="flex flex-col items-center gap-5 pt-10 text-center">
        <div className="flex w-full items-center gap-4">
          <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
          <span className="text-[14px] text-neutral-500 dark:text-neutral-400">
            You’ve seen all{' '}
            <span className="font-semibold tabular-nums text-[#111111] dark:text-white">{totalElements}</span> {noun}
          </span>
          <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => scrollParentToTop(rootRef.current)}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#111111] transition-colors hover:text-[#FF5722] dark:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            Back to top
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
      aria-label="Pagination"
      className="flex flex-col gap-6 border-t border-black/[0.06] pt-8 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-2.5">
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400">
          Showing{' '}
          <span className="font-semibold tabular-nums text-[#111111] dark:text-white">
            {from}–{to}
          </span>{' '}
          of <span className="font-semibold tabular-nums text-[#111111] dark:text-white">{totalElements}</span> {noun}
        </p>
        <div className="h-[3px] w-40 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]" aria-hidden>
          <div
            className="h-full rounded-full bg-[#111111] transition-[width] duration-500 ease-out dark:bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
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
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-[14px] tabular-nums transition-colors ${
                  item === page
                    ? 'bg-[#111111] font-semibold text-white dark:bg-white dark:text-[#111111]'
                    : 'text-neutral-600 hover:bg-black/[0.05] hover:text-[#111111] dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-white'
                }`}
              >
                {item + 1}
              </button>
            ) : (
              <span key={item} aria-hidden className="w-6 text-center text-[14px] text-neutral-400">
                …
              </span>
            )
          )}
          <button
            type="button"
            aria-label="Next page"
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
