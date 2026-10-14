'use client';

import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  createDirectGuestInvite,
  listConversationParticipants,
  listConversations,
  searchMessagingUsers,
} from '@/lib/messaging';
import { listFollowingCreators } from '@/lib/marketplace-api';
import type { MarketplaceCreatorSummary } from '@/types/marketplace';
import type { ConversationSummary, MessagingUserSummary } from '@/types/messaging';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import {
  X_EMPTY,
  X_KICKER,
  X_KICKER_MARK,
  X_LIST_ROW,
  X_ROW_ACTION,
  X_ROW_NAME,
  X_SEARCH_ICON,
  X_SEARCH_PILL,
} from '@/components/messaging/messaging-x';
import { useT } from '@/lib/i18n/I18nProvider';

type TemporaryGuestInviteModalProps = {
  conversationId: string;
  conversationTitle?: string;
  currentUserId?: string | null;
  onClose: () => void;
  onInvited: () => void;
};

function creatorToUser(creator: MarketplaceCreatorSummary): MessagingUserSummary | null {
  const id = String(creator.userId ?? creator.id ?? '');
  if (!id) return null;
  return {
    id,
    fullName: creator.fullName?.trim() || 'Member',
    avatarUrl: creator.avatarUrl ?? null,
  };
}

function contactsFromConversations(conversations: ConversationSummary[]): MessagingUserSummary[] {
  const seen = new Set<string>();
  const result: MessagingUserSummary[] = [];
  for (const conversation of conversations) {
    if (conversation.type !== 'DIRECT' || !conversation.otherUserId) continue;
    if (seen.has(conversation.otherUserId)) continue;
    seen.add(conversation.otherUserId);
    result.push({
      id: conversation.otherUserId,
      fullName: conversation.otherUserName,
      avatarUrl: conversation.otherUserAvatarUrl ?? null,
    });
  }
  return result;
}

function mergeUsers(...lists: MessagingUserSummary[][]): MessagingUserSummary[] {
  const seen = new Set<string>();
  const result: MessagingUserSummary[] = [];
  for (const list of lists) {
    for (const user of list) {
      if (!user.id || seen.has(user.id)) continue;
      seen.add(user.id);
      result.push(user);
    }
  }
  return result;
}

export function TemporaryGuestInviteModal({
  conversationId,
  conversationTitle: _conversationTitle,
  currentUserId = null,
  onClose,
  onInvited,
}: TemporaryGuestInviteModalProps) {
  const t = useT();
  const [memberSearch, setMemberSearch] = useState('');
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<MessagingUserSummary[]>([]);
  const [suggestions, setSuggestions] = useState<MessagingUserSummary[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingIds = useMemo(() => new Set(existingMemberIds), [existingMemberIds]);
  const query = memberSearch.trim();
  const isSearching = query.length >= 2;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSuggestionsLoading(true);
      try {
        const [conversations, followingPage, participants] = await Promise.all([
          listConversations(),
          listFollowingCreators(0, 20).catch(() => ({ content: [] as MarketplaceCreatorSummary[] })),
          listConversationParticipants(conversationId),
        ]);
        if (cancelled) return;

        const followingUsers = followingPage.content
          .map(creatorToUser)
          .filter((user): user is MessagingUserSummary => user != null);

        setSuggestions(mergeUsers(contactsFromConversations(conversations), followingUsers));
        setExistingMemberIds(participants.map((participant) => participant.userId));
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setExistingMemberIds([]);
        }
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSearchLoading(true);
      void (async () => {
        try {
          const users = await searchMessagingUsers(query, 0, 20);
          if (!cancelled) setSearchResults(users);
        } catch {
          if (!cancelled) setSearchResults([]);
        } finally {
          if (!cancelled) setSearchLoading(false);
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const visibleCandidates = useMemo(() => {
    const source = isSearching ? searchResults : suggestions;
    const normalizedQuery = query.toLowerCase();
    return source.filter((candidate) => {
      if (!candidate.id || candidate.id === currentUserId || existingIds.has(candidate.id)) return false;
      if (!isSearching && normalizedQuery) {
        return candidate.fullName.toLowerCase().includes(normalizedQuery);
      }
      return true;
    });
  }, [currentUserId, existingIds, isSearching, query, searchResults, suggestions]);

  const handleInvite = async (candidate: MessagingUserSummary) => {
    if (!candidate.id || invitingId) return;
    setInvitingId(candidate.id);
    setError(null);
    try {
      await createDirectGuestInvite(conversationId, candidate.id, 48);
      onInvited();
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to send invite.')));
    } finally {
      setInvitingId(null);
    }
  };

  const emptyMessage = (() => {
    if (isSearching) return t('No users found.');
    if (query.length === 1) return t('Type at least 2 characters.');
    if (suggestionsLoading) return null;
    return t('No recent contacts.');
  })();

  return (
    <ContentPostDialogShell open title={t('Invite a guest')} onClose={onClose} busy={invitingId != null}>
      <p className="px-5 pb-3 text-[15px] leading-5 text-[#536471] dark:text-[#71767B]">
        {t('They can read and write in this conversation for 48 hours.')}
      </p>
      <div className="px-5 pb-2">
        <div className="relative">
          <svg className={X_SEARCH_ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M20 20l-4.2-4.2" />
            </svg>
          <input
            type="search"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder={t('Search people')}
            aria-label={t('Search people')}
            className={X_SEARCH_PILL}
            autoFocus
          />
        </div>
      </div>

      {error ? (
        <div className="px-5 pb-2">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      ) : null}

      <div className="min-h-[200px] pb-3">
        {!isSearching && visibleCandidates.length > 0 ? <p className={X_KICKER}><span aria-hidden className={X_KICKER_MARK} />{t('Recent')}</p> : null}
        {isSearching && !searchLoading && visibleCandidates.length > 0 ? <p className={X_KICKER}><span aria-hidden className={X_KICKER_MARK} />{t('Results')}</p> : null}

        {suggestionsLoading || searchLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : visibleCandidates.length === 0 ? (
          emptyMessage ? <p className={X_EMPTY}>{emptyMessage}</p> : null
        ) : (
          <ul>
            {visibleCandidates.map((candidate) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  onClick={() => void handleInvite(candidate)}
                  disabled={invitingId != null}
                  className={X_LIST_ROW}
                >
                  <Avatar avatarUrl={candidate.avatarUrl} name={candidate.fullName} size="md" tone="muted" />
                  <span className={`min-w-0 flex-1 ${X_ROW_NAME}`}>{candidate.fullName}</span>
                  {invitingId === candidate.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <span className={X_ROW_ACTION}>{t('Invite')}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ContentPostDialogShell>
  );
}
