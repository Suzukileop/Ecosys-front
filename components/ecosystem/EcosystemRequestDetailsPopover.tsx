'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RequestCodeBadge } from '@/components/ecosystem/RequestCodeBadge';
import { EcosystemPlatformBadges } from '@/components/ecosystem/EcosystemPlatformBadges';
import { getRowCode, getSubscriptionPeriod } from '@/components/ecosystem/ecosystem-request-utils';

type Props = {
  row: unknown;
  className?: string;
};

export function EcosystemRequestDetailsPopover({ row, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const panelWidth = 280;
    const margin = 8;
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - margin) {
      left = window.innerWidth - panelWidth - margin;
    }
    left = Math.max(margin, left);
    setPosition({ top: rect.bottom + margin, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const code = getRowCode(row);
  const { startLabel, endLabel } = getSubscriptionPeriod(row);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 ${className}`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Details
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label="Request details"
            style={{ top: position.top, left: position.left }}
            className="fixed z-50 w-[280px] rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
          >
            <dl className="space-y-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Target platforms
                </dt>
                <dd className="mt-2">
                  <EcosystemPlatformBadges row={row} />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Code
                </dt>
                <dd className="mt-1">
                  <RequestCodeBadge code={code} />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Subscription start
                </dt>
                <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">{startLabel}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Subscription end
                </dt>
                <dd className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">1 month period</dd>
                <dd className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">{endLabel}</dd>
              </div>
            </dl>
          </div>,
          document.body
        )}
    </>
  );
}
