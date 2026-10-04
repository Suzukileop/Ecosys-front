'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { recordShare } from '@/lib/marketplace-api';
import { createOrGetConversation, listConversations, searchMessagingUsers, sendTextMessage } from '@/lib/messaging';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';

const subscribeNoop = () => () => {};

type ShareRecipient = {
  key: string;
  name: string;
  avatarUrl?: string | null;
  conversationId?: string;
  userId?: string;
};

type ContentPostShareDialogProps = {
  open: boolean;
  onClose: () => void;
  postId: string;
  /** Path or absolute URL of the post. */
  shareUrl: string;
  shareTitle?: string;
};

const SHARE_TEXT_MAX = 180;

function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

function CheckBadge() {
  return (
    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#111111] text-white dark:border-[#0A0A0A] dark:bg-white dark:text-[#111111]">
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function ExternalTarget({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-[68px] shrink-0 flex-col items-center gap-2 rounded-xl py-1 outline-none"
    >
      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-neutral-100 transition group-hover:bg-neutral-200 group-focus-visible:ring-2 group-focus-visible:ring-[#111111]/30 group-active:scale-95 dark:bg-white/[0.08] dark:group-hover:bg-white/[0.14] dark:group-focus-visible:ring-white/40">
        {children}
      </span>
      <span className="text-[12px] leading-tight text-neutral-600 dark:text-neutral-400">{label}</span>
    </button>
  );
}

const ICON = 'h-[22px] w-[22px]';

export function ContentPostShareDialog({ open, onClose, postId, shareUrl, shareTitle }: ContentPostShareDialogProps) {
  const { user } = useAuth();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [wasOpen, setWasOpen] = useState(open);
  const [recent, setRecent] = useState<ShareRecipient[] | null>(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState<{ query: string; items: ShareRecipient[] } | null>(null);
  const [selected, setSelected] = useState<Map<string, ShareRecipient>>(new Map());
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setSearch(null);
      setSelected(new Map());
      setNote('');
      setSending(false);
      setCopied(false);
    }
  }

  const absoluteUrl = useMemo(() => {
    if (typeof window === 'undefined') return shareUrl;
    return new URL(shareUrl, window.location.origin).href;
  }, [shareUrl]);

  const shareText = shareTitle ? truncate(shareTitle, SHARE_TEXT_MAX) : '';
  const canUseNativeShare = mounted && typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const track = useCallback(
    (platform: string) => {
      if (!user) return;
      void recordShare('POST', postId, platform).catch(() => undefined);
    },
    [postId, user]
  );

  const handleClose = useCallback(() => {
    if (sending) return;
    onClose();
  }, [onClose, sending]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    void listConversations()
      .then((conversations) => {
        if (cancelled) return;
        setRecent(
          conversations
            .filter((c) => !c.guestSession && !c.temporarySession && c.id)
            .slice(0, 12)
            .map((c) =>
              c.type === 'GROUP'
                ? { key: `c:${c.id}`, name: c.otherUserName, avatarUrl: c.otherUserAvatarUrl, conversationId: c.id }
                : {
                    key: `u:${c.otherUserId}`,
                    name: c.otherUserName,
                    avatarUrl: c.otherUserAvatarUrl,
                    conversationId: c.id,
                    userId: c.otherUserId,
                  }
            )
        );
      })
      .catch(() => {
        if (!cancelled) setRecent([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  const trimmedQuery = query.trim();
  const isSearch = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!open || !user || !isSearch) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void searchMessagingUsers(trimmedQuery, 0, 12)
        .then((users) => {
          if (cancelled) return;
          setSearch({
            query: trimmedQuery,
            items: users
              .filter((u) => u.id !== user.id)
              .map((u) => ({ key: `u:${u.id}`, name: u.fullName, avatarUrl: u.avatarUrl, userId: u.id })),
          });
        })
        .catch(() => {
          if (!cancelled) setSearch({ query: trimmedQuery, items: [] });
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, isSearch, trimmedQuery, user]);

  useEffect(
    () => () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    },
    []
  );

  const toggleRecipient = (recipient: ShareRecipient) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(recipient.key)) next.delete(recipient.key);
      else next.set(recipient.key, recipient);
      return next;
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      track('copy');
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      pushFlashFeedback({ variant: 'error', title: 'Unable to copy the link' });
    }
  };

  const openExternal = (platform: string) => {
    const url = encodeURIComponent(absoluteUrl);
    const text = encodeURIComponent(shareText);
    const targets: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText ? `${shareText} ${absoluteUrl}` : absoluteUrl)}`,
      x: `https://twitter.com/intent/tweet?url=${url}${shareText ? `&text=${text}` : ''}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      telegram: `https://t.me/share/url?url=${url}${shareText ? `&text=${text}` : ''}`,
    };
    track(platform);
    window.open(targets[platform], '_blank', 'noopener,noreferrer,width=640,height=720');
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(shareText || 'Check out this post');
    const body = encodeURIComponent(shareText ? `${shareText}\n\n${absoluteUrl}` : absoluteUrl);
    track('email');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareNative = async () => {
    try {
      await navigator.share({ title: shareText || undefined, url: absoluteUrl });
      track('native');
    } catch {
      // dismissed
    }
  };

  const sendToSelected = async () => {
    if (!selected.size || sending) return;
    setSending(true);
    const content = note.trim() ? `${note.trim()}\n${absoluteUrl}` : absoluteUrl;
    const outcomes = await Promise.allSettled(
      [...selected.values()].map(async (recipient) => {
        const conversationId =
          recipient.conversationId ?? (recipient.userId ? (await createOrGetConversation(recipient.userId)).id : null);
        if (!conversationId) throw new Error('No conversation');
        await sendTextMessage(conversationId, content);
      })
    );
    setSending(false);
    const failed = outcomes.filter((o) => o.status === 'rejected').length;
    const sent = outcomes.length - failed;
    if (sent > 0) track('message');
    if (failed === 0) {
      pushFlashFeedback({ variant: 'success', title: sent === 1 ? 'Sent' : `Sent to ${sent} people` });
      onClose();
    } else {
      pushFlashFeedback({
        variant: 'error',
        title: sent > 0 ? `Sent to ${sent}, ${failed} failed` : 'Unable to send the post',
      });
    }
  };

  if (!open || !mounted) return null;

  const searchResults = isSearch && search ? search.items : null;
  const people = isSearch ? (searchResults ?? []) : (recent ?? []);
  const loadingPeople = isSearch ? search?.query !== trimmedQuery && !searchResults?.length : recent === null;
  const selectedExtra = [...selected.values()].filter((r) => !people.some((p) => p.key === r.key));

  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-end justify-center sm:items-start sm:px-5 sm:pt-[10vh]">
      <button
        type="button"
        className="fixed inset-0 h-[100dvh] w-full cursor-default bg-black/40 dark:bg-black/60"
        aria-label="Close"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share post"
        className="relative z-[211] flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-black/[0.08] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:border-white/[0.1] dark:bg-[#0A0A0A] sm:max-w-[480px] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
          <h2 className="text-[17px] font-bold text-[#111111] dark:text-white">Share</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/[0.06] hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <section className="px-5 pb-5">
            <p className="mb-3 text-[13px] font-semibold text-neutral-500 dark:text-neutral-400">Send to</p>
            {user ? (
              <>
                <label className="flex items-center gap-2.5 rounded-full bg-neutral-100 px-4 py-2.5 transition focus-within:bg-white focus-within:shadow-[0_0_0_1.5px_#111111] dark:bg-white/[0.07] dark:focus-within:bg-transparent dark:focus-within:shadow-[0_0_0_1.5px_rgba(255,255,255,0.8)]">
                  <svg className="h-4 w-4 shrink-0 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
                  </svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search people"
                    aria-label="Search people"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111111] outline-none placeholder:text-neutral-500 dark:text-white"
                  />
                </label>

                {selectedExtra.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedExtra.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => toggleRecipient(r)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] py-1 pl-3 pr-2 text-[13px] font-medium text-white dark:bg-white dark:text-[#111111]"
                      >
                        {r.name}
                        <svg className="h-3.5 w-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 min-h-[104px]">
                  {loadingPeople ? (
                    <div className="grid grid-cols-4 gap-y-4 sm:grid-cols-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <span className="h-12 w-12 animate-pulse rounded-full bg-neutral-100 dark:bg-white/[0.07]" />
                          <span className="h-2.5 w-12 animate-pulse rounded-full bg-neutral-100 dark:bg-white/[0.07]" />
                        </div>
                      ))}
                    </div>
                  ) : people.length ? (
                    <div className="grid grid-cols-4 gap-y-4 sm:grid-cols-5">
                      {people.map((r) => {
                        const isSelected = selected.has(r.key);
                        return (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => toggleRecipient(r)}
                            aria-pressed={isSelected}
                            className="group flex flex-col items-center gap-1.5 rounded-xl px-1 py-1 outline-none focus-visible:bg-neutral-100 dark:focus-visible:bg-white/[0.06]"
                          >
                            <span
                              className={`relative rounded-full transition ${
                                isSelected ? 'scale-[0.92]' : 'group-hover:opacity-85 group-active:scale-95'
                              }`}
                            >
                              <Avatar name={r.name} avatarUrl={r.avatarUrl} size="lg" tone="muted" />
                              {isSelected ? <CheckBadge /> : null}
                            </span>
                            <span
                              className={`line-clamp-2 w-full text-center text-[12px] leading-tight ${
                                isSelected ? 'font-semibold text-[#111111] dark:text-white' : 'text-neutral-600 dark:text-neutral-400'
                              }`}
                            >
                              {r.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-[14px] text-neutral-500 dark:text-neutral-400">
                      {isSearch ? 'No one found.' : 'Search for someone to send this post to.'}
                    </p>
                  )}
                </div>

                {selected.size ? (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-black/[0.1] p-1.5 pl-4 focus-within:border-[#111111]/50 dark:border-white/[0.12] dark:focus-within:border-white/50">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void sendToSelected();
                        }
                      }}
                      maxLength={500}
                      placeholder="Add a message…"
                      aria-label="Message"
                      className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111111] outline-none placeholder:text-neutral-500 dark:text-white"
                    />
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => void sendToSelected()}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-black/85 disabled:opacity-60 dark:bg-white dark:text-[#111111] dark:hover:bg-white/85"
                    >
                      {sending ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                      ) : null}
                      {selected.size > 1 ? `Send (${selected.size})` : 'Send'}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="rounded-2xl bg-neutral-100 px-4 py-4 text-[14px] text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-300">
                <Link href="/login" className="font-semibold text-[#111111] hover:underline dark:text-white">
                  Log in
                </Link>{' '}
                to send this post to someone in a private message.
              </p>
            )}
          </section>

          <section className="border-t border-black/[0.08] py-5 dark:border-white/[0.08]">
            <p className="mb-3 px-5 text-[13px] font-semibold text-neutral-500 dark:text-neutral-400">Share to</p>
            <div className="flex gap-1 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ExternalTarget label="WhatsApp" onClick={() => openExternal('whatsapp')}>
                <svg className={`${ICON} text-[#25D366]`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </ExternalTarget>
              <ExternalTarget label="X" onClick={() => openExternal('x')}>
                <svg className="h-[19px] w-[19px] text-[#111111] dark:text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </ExternalTarget>
              <ExternalTarget label="LinkedIn" onClick={() => openExternal('linkedin')}>
                <svg className={`${ICON} text-[#0A66C2] dark:text-[#4A9BE8]`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </ExternalTarget>
              <ExternalTarget label="Facebook" onClick={() => openExternal('facebook')}>
                <svg className={`${ICON} text-[#1877F2]`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </ExternalTarget>
              <ExternalTarget label="Telegram" onClick={() => openExternal('telegram')}>
                <svg className={`${ICON} text-[#26A5E4]`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </ExternalTarget>
              <ExternalTarget label="Email" onClick={shareByEmail}>
                <svg className={`${ICON} text-[#111111] dark:text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 7l8.5 6 8.5-6" />
                </svg>
              </ExternalTarget>
              {canUseNativeShare ? (
                <ExternalTarget label="More" onClick={() => void shareNative()}>
                  <svg className={`${ICON} text-[#111111] dark:text-white`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <circle cx="5" cy="12" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="19" cy="12" r="1.8" />
                  </svg>
                </ExternalTarget>
              ) : null}
            </div>
          </section>

          <section className="border-t border-black/[0.08] px-5 py-5 dark:border-white/[0.08]">
            <div className="flex items-center gap-2 rounded-xl border border-black/[0.1] p-1.5 pl-3.5 dark:border-white/[0.12]">
              <svg className="h-4 w-4 shrink-0 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.8 10.2a4 4 0 00-5.6 0l-4 4a4 4 0 105.6 5.6l1.1-1.1m-.7-4.9a4 4 0 005.6 0l4-4a4 4 0 10-5.6-5.6l-1.1 1.1" />
              </svg>
              <span className="min-w-0 flex-1 truncate text-[14px] text-neutral-600 dark:text-neutral-300" title={absoluteUrl}>
                {absoluteUrl.replace(/^https?:\/\//, '')}
              </span>
              <button
                type="button"
                onClick={() => void copyLink()}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[14px] font-semibold transition ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-[#111111] text-white hover:bg-black/85 dark:bg-white dark:text-[#111111] dark:hover:bg-white/85'
                }`}
              >
                {copied ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                ) : null}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}
