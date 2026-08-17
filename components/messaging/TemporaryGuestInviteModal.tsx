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
      setError(getApiErrorMessage(e, 'Unable to send invite.'));
    } finally {
      setInvitingId(null);
    }
  };

  const emptyMessage = (() => {
    if (isSearching) return 'No users found.';
    if (query.length === 1) return 'Type at least 2 characters.';
    if (suggestionsLoading) return null;
    return 'No recent contacts.';
  })();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-invite-title"
        className="relative flex max-h-[min(85vh,560px)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
          <h2 id="guest-invite-title" className="text-lg font-bold text-neutral-900 dark:text-white">
            Invite guest
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Temporary access · 48 hours
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-3">
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          <input
            type="search"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-500"
            autoFocus
          />

          <div className="mt-4">
            {!isSearching && visibleCandidates.length > 0 && (
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Recent
              </p>
            )}
            {isSearching && !searchLoading && visibleCandidates.length > 0 && (
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Results
              </p>
            )}

            {suggestionsLoading || searchLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : visibleCandidates.length === 0 ? (
              emptyMessage ? (
                <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
              ) : null
            ) : (
              <ul className="space-y-1.5">
                {visibleCandidates.map((candidate) => (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      onClick={() => void handleInvite(candidate)}
                      disabled={invitingId != null}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-neutral-100 disabled:opacity-60 dark:hover:bg-neutral-800"
                    >
                      <Avatar avatarUrl={candidate.avatarUrl} name={candidate.fullName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                          {candidate.fullName}
                        </p>
                      </div>
                      {invitingId === candidate.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Invite</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
