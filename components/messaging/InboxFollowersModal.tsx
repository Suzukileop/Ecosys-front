'use client';

import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { usePresence } from '@/hooks/usePresence';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import {
  X_EMPTY,
  X_LIST_ROW,
  X_ROW_META,
  X_ROW_NAME,
  X_SEARCH_ICON,
  X_SEARCH_PILL,
} from '@/components/messaging/messaging-x';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  listCreatorProfileFollowers,
  type CreatorProfileFollowerItem,
} from '@/lib/creator-profile-followers-api';
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
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
          setError(getApiErrorMessage(e, t('Unable to load your audience.')));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, t]);

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
      setError(getApiErrorMessage(e, t('Unable to load more contacts.')));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <ContentPostDialogShell open={open} title={t('Audience')} onClose={onClose}>
      <div className="px-5 pb-2 pt-1">
        <label htmlFor="inbox-followers-search" className="sr-only">
          {t('Search audience')}
        </label>
        <div className="relative">
          <svg className={X_SEARCH_ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M20 20l-4.2-4.2" />
            </svg>
          <input
            id="inbox-followers-search"
            type="search"
            value={search}
            autoFocus
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search your audience')}
            className={X_SEARCH_PILL}
          />
        </div>
      </div>

      {error ? (
        <div className="px-5 pb-2">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      ) : null}

      <div className="min-h-[220px] pb-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <p className={X_EMPTY}>
            {search.trim() ? t('No matches in your audience.') : t('No one in your audience yet.')}
          </p>
        ) : (
          <>
            <ul role="listbox" aria-label={t('Audience')}>
              {filtered.map((follower) => {
                const name = follower.followerFullName?.trim() || 'Contact';
                const busy = selectingUserId === follower.followerUserId;
                const online = isOnline(follower.followerUserId);
                const statusLabel = online ? t('Online') : t('Offline');
                return (
                  <li key={follower.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={busy}
                      disabled={selectingUserId != null}
                      onClick={() => void onSelectFollower(follower)}
                      aria-label={`${name}, ${statusLabel}`}
                      className={X_LIST_ROW}
                    >
                      <span className="relative shrink-0">
                        <Avatar avatarUrl={follower.followerAvatarUrl} name={name} size="md" tone="muted" />
                        {online ? (
                          <span
                            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#00BA7C] dark:border-black"
                            aria-hidden
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block ${X_ROW_NAME}`}>{name}</span>
                        <span className={`block ${X_ROW_META}`}>{online ? t('Online') : t('Message')}</span>
                      </span>
                      {busy ? <LoadingSpinner size="sm" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            {!last && !search.trim() ? (
              <div className="flex justify-center px-4 pt-2">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => void loadMore()}
                  className="inline-flex h-10 items-center justify-center rounded-full px-5 text-[14px] font-semibold text-[#0F1419] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] disabled:opacity-50 dark:text-[#E7E9EA] dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)]"
                >
                  {loadingMore ? t('Loading…') : t('Show more')}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </ContentPostDialogShell>
  );
}
