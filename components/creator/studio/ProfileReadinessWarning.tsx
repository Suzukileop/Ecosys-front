'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import {
  PROFILE_READINESS_LABELS,
  type ProfileReadinessField,
} from '@/lib/creator-profile-readiness';

type ProfileReadinessWarningProps = {
  missingFields: ProfileReadinessField[];
  title?: string;
  description?: string;
};

export function ProfileReadinessWarning({
  missingFields,
  title = 'Complete your profile first',
  description = 'Add the required profile details before you can publish.',
}: ProfileReadinessWarningProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
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

  if (missingFields.length === 0) return null;

  return (
    <div className="flex justify-end">
      <div ref={rootRef} className="relative z-20 inline-flex shrink-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-amber-300/80 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/25"
          aria-expanded={open}
          aria-haspopup="dialog"
          title={title}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4 shrink-0" />
          <span>Warning</span>
        </button>
        {open ? (
          <div
            role="dialog"
            className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-amber-200 bg-white p-4 shadow-lg dark:border-amber-500/30 dark:bg-neutral-950"
          >
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">{title}</p>
            <p className="mt-2 text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80">
              {description}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {missingFields.map((field) => (
                <li
                  key={field}
                  className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-100"
                >
                  {PROFILE_READINESS_LABELS[field]}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/creator?tab=profile"
              className="mt-3 inline-flex rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
              onClick={() => setOpen(false)}
            >
              Open Information
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
