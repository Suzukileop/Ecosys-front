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
import { MediaImage } from '@/components/ui/MediaImage';
import type { ProfileServiceItem } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
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

  const deliveryLabel = formatServiceDelivery(service);
  const hue = solidCoverHueFromTitle(service.title || 'Service');

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(91,112,131,0.4)] dark:bg-[rgba(91,112,131,0.3)]"
        aria-label={t('Close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={service.title}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-black dark:shadow-[0_0_15px_rgba(255,255,255,0.2)] sm:max-h-[min(88vh,720px)] sm:rounded-2xl"
      >
        <div className="relative aspect-[16/9] shrink-0 bg-[#EFF3F4] dark:bg-[#202327]">
          <MediaImage
            src={service.coverImageUrl}
            widths={[640, 828, 1080]}
            sizes="(min-width: 640px) 512px, 100vw"
            priority
            fallback={
              <div
                className="flex h-full items-center justify-center text-4xl font-bold text-white/90"
                style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
              >
                {(service.title.trim()[0] || 'S').toUpperCase()}
              </div>
            }
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(15,20,25,0.75)] text-white backdrop-blur-xs transition hover:bg-[rgba(39,44,48,0.75)]"
            aria-label={t('Close')}
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {service.specialty ? (
            <p className="mb-1 text-[13px] capitalize text-[#536471] dark:text-[#71767B]">{service.specialty.toLowerCase()}</p>
          ) : null}
          <h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.015em] text-[#0F1419] dark:text-[#E7E9EA]">{service.title}</h2>
          {service.description ? (
            <p className="mt-3 whitespace-pre-line text-[15px] leading-5 text-[#0F1419] dark:text-[#E7E9EA]">
              {service.description}
            </p>
          ) : null}
          <div className="mt-5 space-y-0.5">
            <p className="text-[20px] font-extrabold tabular-nums text-[#0F1419] dark:text-[#E7E9EA]">
              {formatServicePrice(service)}
            </p>
            {deliveryLabel ? (
              <p className="text-[13px] text-[#536471] dark:text-[#71767B]">{deliveryLabel}</p>
            ) : null}
          </div>
          {service.tasks && service.tasks.length > 0 ? (
            <section className="mt-6" aria-label={t('What\'s included')}>
              <h3 className="text-[15px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">{t('What\'s included')}</h3>
              <ul className="mt-2.5 space-y-2 text-[15px] leading-5 text-[#0F1419] dark:text-[#E7E9EA]">
                {service.tasks.map((task) => (
                  <li key={task} className="flex gap-2.5">
                    <svg
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#00BA7C]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                    <span className="min-w-0 break-words">{task}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {discussHref ? (
          <div className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
            <Link
              href={discussHref}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0F1419] px-4 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]"
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
