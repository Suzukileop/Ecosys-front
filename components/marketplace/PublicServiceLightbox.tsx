'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  formatServiceDelivery,
  formatServicePrice,
  solidCoverHueFromTitle,
} from '@/lib/profile-services';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';
import type { ProfileServiceItem } from '@/types/ecosystem';

type PublicServiceLightboxProps = {
  service: ProfileServiceItem | null;
  open: boolean;
  onClose: () => void;
  discussHref?: string | null;
  discussLabel?: string;
};

export function PublicServiceLightbox({
  service,
  open,
  onClose,
  discussHref = null,
  discussLabel = 'Discuss',
}: PublicServiceLightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open || !service) return null;

  const cover = resolveStorageMediaUrl(service.coverImageUrl) || service.coverImageUrl;
  const deliveryLabel = formatServiceDelivery(service);
  const hue = solidCoverHueFromTitle(service.title || 'Service');

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-neutral-950/55 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={service.title}
        className="relative z-10 flex max-h-[min(88vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-950"
      >
        <div className="relative aspect-[16/9] shrink-0 bg-neutral-100 dark:bg-neutral-800">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full items-center justify-center text-4xl font-bold text-white/90"
              style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
            >
              {(service.title.trim()[0] || 'S').toUpperCase()}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/60"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{service.title}</h2>
          {service.specialty ? (
            <span className="mt-2 inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-300">
              {service.specialty}
            </span>
          ) : null}
          {service.description ? (
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {service.description}
            </p>
          ) : null}
          <div className="mt-5 space-y-1">
            <p className="text-2xl font-bold tabular-nums text-neutral-950 dark:text-white">
              {formatServicePrice(service)}
            </p>
            {deliveryLabel ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{deliveryLabel}</p>
            ) : null}
          </div>
          {service.tasks && service.tasks.length > 0 ? (
            <ul className="mt-5 list-disc space-y-1.5 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
              {service.tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {discussHref ? (
          <div className="shrink-0 border-t border-neutral-200 p-4 dark:border-neutral-800">
            <Link
              href={discussHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
              {discussLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
