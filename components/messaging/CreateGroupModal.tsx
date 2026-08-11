'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { createGroupConversation } from '@/lib/messaging';
import { listFollowingCreators, searchMarketplaceCreators } from '@/lib/marketplace-api';
import type { ConversationSummary } from '@/types/messaging';
import type { MarketplaceCreatorSummary } from '@/types/marketplace';

type CreateGroupModalProps = {
  open: boolean;
  currentUserId?: string | null;
  onClose: () => void;
  onCreated: (conversation: ConversationSummary) => void;
};

type WizardStep = 'intro' | 'name' | 'members';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'intro', label: 'Group' },
  { id: 'name', label: 'Name' },
  { id: 'members', label: 'Members' },
];

function creatorUserId(creator: MarketplaceCreatorSummary): string {
  return String(creator.userId ?? creator.id ?? '');
}

export function CreateGroupModal({ open, currentUserId = null, onClose, onCreated }: CreateGroupModalProps) {
  const [step, setStep] = useState<WizardStep>('intro');
  const [groupName, setGroupName] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<MarketplaceCreatorSummary[]>([]);
  const [searchResults, setSearchResults] = useState<MarketplaceCreatorSummary[]>([]);
  const [suggestions, setSuggestions] = useState<MarketplaceCreatorSummary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep('intro');
    setGroupName('');
    setCoverFile(null);
    setCoverPreview(null);
    setMemberSearch('');
    setSelectedMembers([]);
    setSearchResults([]);
    setSuggestions([]);
    setSearchLoading(false);
    setSubmitting(false);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleCoverSelected = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Cover image must be 5 MB or smaller.');
      return;
    }
    setError(null);
    setCoverFile(file);
    setCoverPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const page = await listFollowingCreators(0, 12);
        if (!cancelled) setSuggestions(page.content);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || step !== 'members') return;
    const query = memberSearch.trim();
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
          const page = await searchMarketplaceCreators(query, 0, 12);
          if (!cancelled) setSearchResults(page.content);
        } catch {
          if (!cancelled) setSearchResults([]);
        } finally {
          if (!cancelled) setSearchLoading(false);
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [memberSearch, open, step]);

  const selectedIds = useMemo(
    () => new Set(selectedMembers.map((member) => creatorUserId(member)).filter(Boolean)),
    [selectedMembers]
  );

  const visibleCandidates = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    const source = query.length >= 2 ? searchResults : suggestions;
    return source.filter((candidate) => {
      const id = creatorUserId(candidate);
      if (!id || id === currentUserId || selectedIds.has(id)) return false;
      if (!query) return true;
      return candidate.fullName.toLowerCase().includes(query);
    });
  }, [memberSearch, searchResults, selectedIds, suggestions, currentUserId]);

  const toggleMember = (candidate: MarketplaceCreatorSummary) => {
    const id = creatorUserId(candidate);
    if (!id) return;
    setSelectedMembers((current) => {
      if (current.some((member) => creatorUserId(member) === id)) {
        return current.filter((member) => creatorUserId(member) !== id);
      }
      return [...current, candidate];
    });
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleCreate = async () => {
    const title = groupName.trim();
    if (!title) {
      setError('Please enter a group name.');
      setStep('name');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const memberIds = selectedMembers
        .map((member) => creatorUserId(member))
        .filter((id) => id && id !== currentUserId);
      const group = await createGroupConversation({ title, memberIds }, coverFile);
      onCreated(group);
      reset();
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to create group.'));
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = STEPS.findIndex((item) => item.id === step);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
        className="relative flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#EA580C] dark:text-[#FB923C]">
                New group
              </p>
              <h2 id="create-group-title" className="text-lg font-bold text-neutral-900 dark:text-white">
                {step === 'intro' && 'Create a group chat'}
                {step === 'name' && 'Name your group'}
                {step === 'members' && 'Add members'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {STEPS.map((item, index) => (
              <div key={item.id} className="flex min-w-0 flex-1 items-center gap-2">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    index <= stepIndex
                      ? 'bg-[#F97316] text-white'
                      : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`hidden truncate text-xs font-semibold sm:block ${
                    index === stepIndex ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {item.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 ${
                      index < stepIndex ? 'bg-[#F97316]' : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          {step === 'intro' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#FFF7ED] px-4 py-5 dark:bg-[#F97316]/10">
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                  Bring people together in one place. You will choose a group name, then invite members from creators
                  you follow or search across the platform.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#F97316]">•</span>
                  Share messages, files, and calls with everyone in the group.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#F97316]">•</span>
                  You can add more members later from the group info panel.
                </li>
              </ul>
            </div>
          )}

          {step === 'name' && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Group cover</p>
                <div className="overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950">
                  {coverPreview ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverPreview} alt="Group cover preview" className="h-36 w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <label className="cursor-pointer rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-900 transition hover:bg-white">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleCoverSelected(e.target.files?.[0] ?? null)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={clearCover}
                          className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/70"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 px-4 text-center transition hover:bg-neutral-100 dark:hover:bg-neutral-900">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF7ED] text-xl text-[#EA580C] dark:bg-[#F97316]/15">
                        +
                      </span>
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Add a cover photo</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">JPG, PNG or WEBP · max 5 MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleCoverSelected(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="group-name" className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Group name
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Design Sync, Project Alpha..."
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#F97316]/40 focus:ring-2 focus:ring-[#F97316]/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                  autoFocus
                />
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  This name will be visible to all members in the inbox and chat header.
                </p>
              </div>
            </div>
          )}

          {step === 'members' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="member-search" className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Search members
                </label>
                <input
                  id="member-search"
                  type="search"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search creators by name..."
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#F97316]/40 focus:ring-2 focus:ring-[#F97316]/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <button
                      key={creatorUserId(member)}
                      type="button"
                      onClick={() => toggleMember(member)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#FFF7ED] px-2.5 py-1.5 text-xs font-semibold text-[#EA580C] transition hover:bg-[#FFEDD5] dark:bg-[#F97316]/15 dark:text-[#FB923C]"
                    >
                      <Avatar avatarUrl={member.avatarUrl} name={member.fullName} size="xs" />
                      <span>{member.fullName}</span>
                      <span aria-hidden>×</span>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {memberSearch.trim().length >= 2 ? 'Search results' : 'Suggestions'}
                </p>
                {searchLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : visibleCandidates.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                    {memberSearch.trim().length >= 2
                      ? 'No creators found for this search.'
                      : 'No suggestions available yet. Try searching by name.'}
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {visibleCandidates.map((candidate) => {
                      const id = creatorUserId(candidate);
                      const selected = selectedIds.has(id);
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => toggleMember(candidate)}
                            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                              selected
                                ? 'bg-[#FFF7ED] ring-1 ring-[#F97316]/30 dark:bg-[#F97316]/10'
                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            <Avatar avatarUrl={candidate.avatarUrl} name={candidate.fullName} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                {candidate.fullName}
                              </p>
                              {candidate.specialite && (
                                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{candidate.specialite}</p>
                              )}
                            </div>
                            <span
                              className={`text-xs font-bold ${
                                selected ? 'text-[#EA580C] dark:text-[#FB923C]' : 'text-neutral-400'
                              }`}
                            >
                              {selected ? 'Added' : 'Add'}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-neutral-200 px-5 py-4 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => {
              if (step === 'intro') handleClose();
              else if (step === 'name') setStep('intro');
              else setStep('name');
            }}
            disabled={submitting}
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {step === 'intro' ? 'Cancel' : 'Back'}
          </button>

          {step === 'members' ? (
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={submitting || !groupName.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Create group'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (step === 'intro') setStep('name');
                else if (step === 'name') {
                  if (!groupName.trim()) {
                    setError('Please enter a group name.');
                    return;
                  }
                  setError(null);
                  setStep('members');
                }
              }}
              className="rounded-full bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#EA580C]"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
