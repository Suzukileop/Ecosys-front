'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  IconCheck,
  IconFacebook,
  IconLinkedIn,
  IconMail,
  IconShare,
  IconTelegram,
  IconWhatsApp,
  IconX,
} from '@/components/marketplace/ShareButtons';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/*
 * "Share your portfolio" — opened from My Portfolio's Share button. One small dialog, in the site's
 * language: the networks as a row of round targets (each opens its own share page in a new tab, the
 * address already filled in), then the address itself in a field with a Copy pill. Phones that can
 * share natively get a "More" target that opens the system sheet.
 *
 * Portalled to <body> with the News scope re-opened, so it sits over the page and keeps the tokens.
 */

const subscribeNoop = () => () => {};

type Network = { id: string; label: string; icon: ReactNode; href: (url: string, text: string) => string };

const ICON = 'h-[22px] w-[22px]';

const NETWORKS: Network[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: <IconLinkedIn className={ICON} />,
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'x',
    label: 'X',
    icon: <IconX className="h-5 w-5" />,
    href: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'facebook',
    label: msg('Facebook'),
    icon: <IconFacebook className={ICON} />,
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: <IconWhatsApp className={ICON} />,
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: 'telegram',
    label: msg('Telegram'),
    icon: <IconTelegram className={ICON} />,
    href: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'email',
    label: msg('Email'),
    icon: <IconMail className={ICON} />,
    href: (url, text) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
  },
];

const TARGET =
  'group flex flex-col items-center gap-2 rounded-xl py-1 text-[12px] leading-4 text-[color:var(--gn-ink2)] outline-none';
const TARGET_DISC =
  'flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] transition group-hover:bg-[color:var(--gn-hover)] group-focus-visible:ring-2 group-focus-visible:ring-[color:var(--gn-ring)] group-active:scale-95';

export function PortfolioShareDialog({
  open,
  onClose,
  shareUrl,
  shareText,
}: {
  open: boolean;
  onClose: () => void;
  /** The live portfolio's absolute address. */
  shareUrl: string;
  /** The line networks put above the link ("Leopard Julio Cesar — portfolio"). */
  shareText: string;
}) {
  const t = useT();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);
  const canShareNatively = mounted && typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(
    () => () => {
      if (copiedTimer.current != null) window.clearTimeout(copiedTimer.current);
    },
    []
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copiedTimer.current != null) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shareUrl]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="news-theme news-feed news-mono fixed inset-0 z-[240] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('Close')}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/40 dark:bg-black/60"
        style={{ animation: 'gsm-veil-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-share-title"
        className="relative w-full max-w-[460px] rounded-t-2xl bg-[#FEFEFE] p-5 shadow-[0_0_0_1px_#E1E8ED,0_24px_60px_-24px_rgba(15,20,25,0.35)] dark:bg-[#000000] dark:shadow-[0_0_0_1px_#2F3336] sm:rounded-2xl sm:p-6"
        style={{ animation: 'pf-float-in 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="portfolio-share-title" className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">
              {t('Share your portfolio')}
            </h2>
            <p className="mt-1 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{t('Anyone with the link can see your live page.')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="-mr-2 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-y-4 sm:grid-cols-6">
          {NETWORKS.map((network) => (
            <a
              key={network.id}
              href={network.href(shareUrl, shareText)}
              target={network.id === 'email' ? undefined : '_blank'}
              rel="noopener noreferrer"
              className={TARGET}
            >
              <span className={TARGET_DISC}>{network.icon}</span>
              {network.label}
            </a>
          ))}
          {canShareNatively ? (
            <button
              type="button"
              className={`${TARGET} sm:hidden`}
              onClick={() => void navigator.share({ title: shareText, url: shareUrl }).catch(() => undefined)}
            >
              <span className={TARGET_DISC}>
                <IconShare className="h-5 w-5" />
              </span>
              {t('More')}
            </button>
          ) : null}
        </div>

        <p className="gn-kicker mt-6 pb-2">{t('Page link')}</p>
        <div className="flex h-12 items-center gap-2 bg-[color:var(--gn-surface)] pl-4 pr-1.5">
          <input
            readOnly
            value={shareUrl}
            aria-label={t('Portfolio link')}
            onFocus={(event) => event.currentTarget.select()}
            className="min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-[14px] text-[color:var(--gn-ink)] outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--gn-primary)] px-4 text-[14px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
          >
            {copied ? <IconCheck className="h-4 w-4" /> : null}
            {copied ? t('Copied') : t('Copy')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
