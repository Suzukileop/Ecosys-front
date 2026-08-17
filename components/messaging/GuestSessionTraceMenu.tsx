'use client';

import { useEffect, useRef, useState } from 'react';
import type { DirectMessage } from '@/types/messaging';
import { formatGuestTraceTime } from '@/lib/guest-session-trace';

type GuestSessionTraceMenuProps = {
  traces: DirectMessage[];
};

export function GuestSessionTraceMenu({ traces }: GuestSessionTraceMenuProps) {
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
        className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Temporary guest activity"
      >
        Temporary · {traces.length}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Temporary guest activity"
          className="absolute left-0 top-[calc(100%+6px)] z-40 w-72 rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Guest activity
          </p>
          <ul className="max-h-52 space-y-2 overflow-y-auto [scrollbar-width:thin]">
            {[...traces].reverse().map((trace) => (
              <li
                key={trace.id}
                className="rounded-xl border border-neutral-100 bg-neutral-50 px-2.5 py-2 dark:border-neutral-800 dark:bg-neutral-800/60"
              >
                <p className="text-xs leading-snug text-neutral-700 dark:text-neutral-200">{trace.content}</p>
                <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
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
