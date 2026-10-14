'use client';

import { useEffect, useRef, useState } from 'react';
import type { DirectMessage } from '@/types/messaging';
import { formatGuestTraceTime } from '@/lib/guest-session-trace';
import { useT } from '@/lib/i18n/I18nProvider';

type GuestSessionTraceMenuProps = {
  traces: DirectMessage[];
};

export function GuestSessionTraceMenu({ traces }: GuestSessionTraceMenuProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  if (traces.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 items-center rounded-full border border-[#CFD9DE] px-3.5 text-[13px] font-bold text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:border-[#536471] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]"
        aria-expanded={open}
        aria-haspopup="dialog"
        title={t('Temporary guest activity')}
      >
        {t('Temporary · {tracesLength}', { tracesLength: traces.length })}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('Temporary guest activity')}
          className="absolute left-0 top-[calc(100%+6px)] z-40 w-72 rounded-xl bg-white p-3 shadow-[0_0_15px_rgba(101,119,134,0.2),0_0_3px_1px_rgba(101,119,134,0.15)] dark:bg-black dark:shadow-[0_0_15px_rgba(255,255,255,0.2),0_0_3px_1px_rgba(255,255,255,0.15)]"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#536471] dark:text-[#71767B]">
            {t('Guest activity')}
          </p>
          <ul className="max-h-52 space-y-2 overflow-y-auto [scrollbar-width:thin]">
            {[...traces].reverse().map((trace) => (
              <li
                key={trace.id}
                className="rounded-xl bg-[#F7F9F9] px-3 py-2 dark:bg-[#16181C]"
              >
                <p className="text-[13px] leading-[18px] text-[#0F1419] dark:text-[#E7E9EA]">{trace.content}</p>
                <p className="mt-1 text-[12px] text-[#536471] dark:text-[#71767B]">
                  {formatGuestTraceTime(trace.sentAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
