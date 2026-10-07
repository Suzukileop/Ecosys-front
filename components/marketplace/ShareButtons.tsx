'use client';

import { useEffect, useRef, useState, type ReactElement } from 'react';
import { recordShare } from '@/lib/marketplace-api';
import type { SocialTargetType } from '@/types/marketplace';

type ShareButtonsProps = {
  targetType: SocialTargetType;
  targetId: string;
  shareUrl: string;
  shareTitle: string;
  isAuthenticated: boolean;
  size?: 'md' | 'lg';
};

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.43 9.43 0 1 1 7.99 4.42Zm8.03-17.46A11.35 11.35 0 0 0 12.05.7C5.8.7.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.6l6.02-1.58a11.33 11.33 0 0 0 5.42 1.38h.01c6.25 0 11.35-5.1 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02Z" />
    </svg>
  );
}

function IconTelegram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.94 0a12 12 0 1 0 .12 24 12 12 0 0 0-.12-24Zm5.56 8.16-1.97 9.28c-.15.66-.54.82-1.09.51l-3-2.21-1.45 1.4c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.21-.05-.33-.37-.12l-6.87 4.33-2.96-.92c-.64-.2-.66-.64.14-.95l11.57-4.46c.54-.2 1.01.13.84.91Z" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 14a4.5 4.5 0 0 0 6.36 0l3-3a4.5 4.5 0 0 0-6.36-6.36l-1.25 1.25" />
      <path d="M14 10a4.5 4.5 0 0 0-6.36 0l-3 3a4.5 4.5 0 0 0 6.36 6.36l1.25-1.25" />
    </svg>
  );
}

function IconShare({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5" />
      <path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'telegram' | 'email';

function buildShareUrl(platform: SharePlatform, shareUrl: string, shareTitle: string): string {
  const url = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(shareTitle);
  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`;
    case 'telegram':
      return `https://t.me/share/url?url=${url}&text=${text}`;
    case 'email':
      return `mailto:?subject=${text}&body=${encodeURIComponent(`${shareTitle}\n\n${shareUrl}`)}`;
  }
}

const SHARE_MENU_ITEMS: { platform: SharePlatform; label: string; Icon: (props: { className?: string }) => ReactElement }[] = [
  { platform: 'whatsapp', label: 'WhatsApp', Icon: IconWhatsApp },
  { platform: 'facebook', label: 'Facebook', Icon: IconFacebook },
  { platform: 'twitter', label: 'X', Icon: IconX },
  { platform: 'linkedin', label: 'LinkedIn', Icon: IconLinkedIn },
  { platform: 'telegram', label: 'Telegram', Icon: IconTelegram },
  { platform: 'email', label: 'Email', Icon: IconMail },
];

type ShareMenuProps = Omit<ShareButtonsProps, 'size'> & { buttonClassName?: string };

/** One "Share" button that opens a menu: copy link first, then social networks. */
export function ShareMenu({ targetType, targetId, shareUrl, shareTitle, isAuthenticated, buttonClassName = '' }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const track = (platform: string) => {
    if (!isAuthenticated) return;
    void recordShare(targetType, targetId, platform).catch(() => undefined);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      track('copy');
    } catch {
      // ignore clipboard errors
    }
  };

  const shareTo = (platform: SharePlatform) => {
    track(platform);
    const url = buildShareUrl(platform, shareUrl, shareTitle);
    if (platform === 'email') window.location.assign(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const itemClass =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-[#111111] transition-colors hover:bg-black/[0.05] dark:text-white dark:hover:bg-white/[0.07]';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={buttonClassName}
      >
        <span className="inline-flex items-center gap-2">
          <IconShare className="h-4 w-4" />
          <span>Share</span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-black/[0.08] bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)] dark:border-white/[0.1] dark:bg-[#161616]"
        >
          <button type="button" role="menuitem" onClick={() => void copyLink()} className={itemClass}>
            {copied ? <IconCheck className="h-[18px] w-[18px]" /> : <IconLink className="h-[18px] w-[18px]" />}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <div className="mx-3 my-1 h-px bg-black/[0.06] dark:bg-white/[0.08]" aria-hidden />
          {SHARE_MENU_ITEMS.map(({ platform, label, Icon }) => (
            <button key={platform} type="button" role="menuitem" onClick={() => shareTo(platform)} className={itemClass}>
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
