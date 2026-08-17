'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { usePresence } from '@/hooks/usePresence';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  listCreatorProfileFollowers,
  type CreatorProfileFollowerItem,
} from '@/lib/creator-profile-followers-api';

const PAGE_SIZE = 40;

type InboxFollowersModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectFollower: (follower: CreatorProfileFollowerItem) => void | Promise<void>;
  selectingUserId?: string | null;
};

export function InboxFollowersModal({
  open,
  onClose,
  onSelectFollower,
  selectingUserId = null,
}: InboxFollowersModalProps) {
  const [search, setSearch] = useState('');
  const [followers, setFollowers] = useState<CreatorProfileFollowerItem[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const followerIds = useMemo(
    () => followers.map((f) => f.followerUserId).filter(Boolean),
    [followers]
  );
  const { isOnline } = usePresence(followerIds, { enabled: open });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await listCreatorProfileFollowers(0, PAGE_SIZE);
        if (cancelled) return;
        setFollowers(data.content);
        setPage(data.page);
        setLast(data.last);
      } catch (e) {
        if (!cancelled) {
          setFollowers([]);
          setError(getApiErrorMessage(e, 'Unable to load your audience.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return followers;
    return followers.filter((follower) =>
      (follower.followerFullName ?? '').toLowerCase().includes(query)
    );
  }, [followers, search]);

  const loadMore = async () => {
    if (loadingMore || last) return;
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const data = await listCreatorProfileFollowers(nextPage, PAGE_SIZE);
      setFollowers((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...data.content.filter((item) => !seen.has(item.id))];
      });
      setPage(data.page);
      setLast(data.last);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load more contacts.'));
    } finally {
      setLoadingMore(false);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inbox-followers-title"
        className="relative z-10 flex max-h-[min(90vh,560px)] w-full max-w-md flex-col overflow-hidden rounded-t-[16px] border border-[var(--msg-border)] bg-[var(--msg-card)] sm:rounded-[var(--msg-radius)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--msg-border)] px-4 py-3">
          <h2 id="inbox-followers-title" className="text-base font-semibold text-[var(--msg-text)]">
            Audience
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-[var(--msg-muted)] transition hover:bg-[var(--msg-bg)] hover:text-[var(--msg-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-brand)]/40"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="shrink-0 px-4 py-3">
          <label htmlFor="inbox-followers-search" className="sr-only">
            Search audience
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="inbox-followers-search"
              type="search"
              value={search}
              autoFocus
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audience…"
              className="h-11 w-full rounded-[10px] border border-neutral-200 bg-neutral-100 py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-400"
            />
          </div>
        </div>

        {error ? (
          <div className="px-4 pb-2">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--msg-muted)]">
              {search.trim() ? 'No matches in your audience.' : 'No one in your audience yet.'}
            </p>
          ) : (
            <>
              <ul className="space-y-0.5" role="listbox" aria-label="Audience">
                {filtered.map((follower) => {
                  const name = follower.followerFullName?.trim() || 'Contact';
                  const busy = selectingUserId === follower.followerUserId;
                  const online = isOnline(follower.followerUserId);
                  const statusLabel = online ? 'Online' : 'Offline';
                  return (
                    <li key={follower.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={busy}
                        disabled={selectingUserId != null}
                        onClick={() => void onSelectFollower(follower)}
                        aria-label={`${name}, ${statusLabel}`}
                        className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition hover:bg-[var(--msg-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-brand)]/40 disabled:opacity-60"
                      >
                        <span className="relative shrink-0">
                          <Avatar
                            avatarUrl={follower.followerAvatarUrl}
                            name={name}
                            size="sm"
                            tone="muted"
                          />
                          <span
                            className={
                              online
                                ? 'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--msg-card)] bg-emerald-500'
                                : 'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--msg-card)] bg-neutral-400 dark:bg-neutral-500'
                            }
                            aria-hidden
                          />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--msg-text)]">
                          {name}
                        </span>
                        {busy ? <LoadingSpinner size="sm" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!last && !search.trim() ? (
                <div className="mt-2 flex justify-center px-3">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => void loadMore()}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-[var(--msg-brand,#F47B20)] transition hover:bg-[var(--msg-bg)] disabled:opacity-60"
                  >
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
