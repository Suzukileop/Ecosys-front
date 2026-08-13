'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faPenToSquare,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { listMyContent, updateCreatorContent } from '@/lib/creator-content-api';
import { getCreatorPortfolio, updateCreatorPortfolio } from '@/lib/creator-profile-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { pushFlashFeedback, pushInsertionLimitFeedback } from '@/stores/flashFeedbackStore';
import type { CreatorContentCreateBody, CreatorContentItemDto } from '@/types/creator-content';
import { MAX_PORTFOLIO_PICKS } from '@/components/creator/studio/ProfilePortfolioPicker';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';
import { portfolioInlineInputClass } from '@/components/portfolio/portfolio-section-shared';

type ContentEditDraft = {
  title: string;
  genre: string;
  description: string;
};

/** Visible on touch devices; hover/focus only on fine-pointer desktops. */
const cardActionVisibilityClass =
  'opacity-100 transition-opacity ' +
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100';

function toEditDraft(post: CreatorContentItemDto): ContentEditDraft {
  return {
    title: post.title ?? '',
    genre: post.genre ?? '',
    description: post.description ?? '',
  };
}

function buildContentUpdateBody(
  post: CreatorContentItemDto,
  draft: ContentEditDraft
): CreatorContentCreateBody | null {
  const mediaUrl = post.mediaUrl?.trim();
  if (!mediaUrl) return null;
  return {
    title: draft.title.trim() || null,
    genre: draft.genre.trim() || null,
    description: draft.description.trim() || null,
    mediaUrl,
    mediaType: post.mediaType ?? 'FILE',
    textColor: post.textColor ?? null,
    moodLabel: post.moodLabel ?? null,
    moodEmoji: post.moodEmoji ?? null,
    taggedUserIds: post.taggedUsers?.map((user) => user.id) ?? [],
    priceInfo: post.priceInfo?.trim() || null,
    toolsUsed: post.toolsUsed ?? [],
    tags: post.tags ?? [],
    isPublic: post.isPublic,
    commentsEnabled: post.commentsEnabled ?? true,
  };
}

function ShowcaseThumbnail({
  mediaUrl,
  order,
  showOrder = true,
}: {
  mediaUrl: string | null | undefined;
  order?: number;
  showOrder?: boolean;
}) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-neutral-100 dark:bg-neutral-800">
      {mediaUrl ? (
        <ProductThumbnailMedia url={mediaUrl} alt="" fit="cover" className="h-full w-full" />
      ) : (
        <span className="flex h-full items-center justify-center text-xs text-neutral-400">
          Preview
        </span>
      )}
      {showOrder && order != null ? (
        <span className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#EA580C] text-xs font-bold text-white shadow-sm">
          {order}
        </span>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  disabled = false,
  tone = 'neutral',
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  tone?: 'neutral' | 'confirm' | 'cancel' | 'danger';
}) {
  const toneClass =
    tone === 'confirm'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
      : tone === 'cancel'
        ? 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
        : tone === 'danger'
          ? 'border-neutral-200 bg-white text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400'
          : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400';

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 ${toneClass}`}
    >
      {children}
    </button>
  );
}

export function PortfolioShowcaseChrome({
  actionsVisible: _actionsVisible = false,
  deleteMode: _deleteMode = false,
  onDeleteModeChange: _onDeleteModeChange,
  pickerOpen = false,
  onPickerOpenChange,
  onSelectionCountChange,
  onCancelEditMode: _onCancelEditMode,
  onRegisterDoneConfirm,
  onHasChangesChange,
}: {
  /** @deprecated Per-card actions; kept for call-site compatibility. */
  actionsVisible?: boolean;
  /** @deprecated Delete is per-card; kept for call-site compatibility. */
  deleteMode?: boolean;
  onDeleteModeChange?: (active: boolean) => void;
  pickerOpen?: boolean;
  onPickerOpenChange?: (open: boolean) => void;
  onSelectionCountChange?: (count: number) => void;
  onCancelEditMode?: () => void;
  onRegisterDoneConfirm?: (confirm: (() => Promise<void>) | null) => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
}) {
  const [posts, setPosts] = useState<CreatorContentItemDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ContentEditDraft | null>(null);
  const [itemSaving, setItemSaving] = useState(false);
  const editingCardRef = useRef<HTMLElement | null>(null);
  const cancelEditRef = useRef<() => void>(() => undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contentPage, curated] = await Promise.all([
        listMyContent('active', 0, 100),
        getCreatorPortfolio(),
      ]);
      setPosts(contentPage.content.filter((post) => post.isPublic));
      const ids = curated.map((post) => post.id).slice(0, MAX_PORTFOLIO_PICKS);
      setSelectedIds(ids);
      setSavedIds(ids);
    } catch (e) {
      const message = getApiErrorMessage(e, 'Unable to load portfolio.');
      setError(message);
      pushFlashFeedback({
        variant: 'error',
        title: 'Portfolio load failed',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (pickerOpen) {
      setEditingId(null);
      setEditDraft(null);
    }
  }, [pickerOpen]);

  const selectedPosts = useMemo(
    () =>
      selectedIds
        .map((id) => posts.find((post) => post.id === id))
        .filter((post): post is CreatorContentItemDto => post != null),
    [selectedIds, posts]
  );

  const availableToPick = useMemo(
    () => posts.filter((post) => !selectedIds.includes(post.id)),
    [posts, selectedIds]
  );

  const canAddMore = selectedIds.length < MAX_PORTFOLIO_PICKS;
  const composeAdd = Boolean(pickerOpen);
  const showPicker = Boolean(pickerOpen && canAddMore);
  const busy = saving || itemSaving;

  useEffect(() => {
    onHasChangesChange?.(false);
  }, [onHasChangesChange]);

  useEffect(() => {
    onRegisterDoneConfirm?.(null);
    return () => onRegisterDoneConfirm?.(null);
  }, [onRegisterDoneConfirm]);

  useEffect(() => {
    onSelectionCountChange?.(selectedIds.length);
  }, [selectedIds.length, onSelectionCountChange]);

  const persistSelection = useCallback(
    async (
      nextIds: string[],
      feedback: { title: string; description?: string }
    ) => {
      const normalized = nextIds.slice(0, MAX_PORTFOLIO_PICKS);
      if (JSON.stringify(normalized) === JSON.stringify(savedIds)) {
        setSelectedIds(normalized);
        return;
      }

      setSaving(true);
      setError(null);
      try {
        await updateCreatorPortfolio(normalized);
        setSelectedIds(normalized);
        setSavedIds(normalized);
        pushFlashFeedback({
          variant: 'success',
          title: feedback.title,
          description: feedback.description,
        });
      } catch (e) {
        const message = getApiErrorMessage(e, 'Unable to update portfolio.');
        setError(message);
        pushFlashFeedback({
          variant: 'error',
          title: 'Portfolio update failed',
          description: message,
        });
        setSelectedIds([...savedIds]);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [savedIds]
  );

  const addPost = async (id: string) => {
    if (selectedIds.includes(id)) return;
    if (!canAddMore) {
      pushInsertionLimitFeedback({
        limit: MAX_PORTFOLIO_PICKS,
        unit: 'portfolio posts',
      });
      return;
    }
    const next = [...selectedIds, id].slice(0, MAX_PORTFOLIO_PICKS);
    onPickerOpenChange?.(false);
    try {
      await persistSelection(next, {
        title: 'Portfolio content added',
      });
    } catch {
      // Error already surfaced.
    }
  };

  const removePost = async (id: string) => {
    const next = selectedIds.filter((item) => item !== id);
    setRemovingId(id);
    setPendingDeleteId(null);
    try {
      await persistSelection(next, {
        title: 'Portfolio content removed',
      });
    } catch {
      // Error already surfaced.
    } finally {
      setRemovingId(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await persistSelection(next, {
        title: 'Portfolio order updated',
      });
    } catch {
      // Error already surfaced.
    }
  };

  const startEdit = (post: CreatorContentItemDto) => {
    if (saving || itemSaving) return;
    onPickerOpenChange?.(false);
    setPendingDeleteId(null);
    setEditingId(post.id);
    setEditDraft(toEditDraft(post));
  };

  const cancelEdit = () => {
    if (itemSaving) return;
    setEditingId(null);
    setEditDraft(null);
  };
  cancelEditRef.current = cancelEdit;

  useEffect(() => {
    if (!editingId || itemSaving) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (editingCardRef.current?.contains(target)) return;
      cancelEditRef.current();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [editingId, itemSaving]);

  const confirmEdit = async (post: CreatorContentItemDto) => {
    if (!editDraft || itemSaving) return;
    const original = toEditDraft(post);
    const unchanged =
      editDraft.title.trim() === original.title.trim() &&
      editDraft.genre.trim() === original.genre.trim() &&
      editDraft.description.trim() === original.description.trim();
    if (unchanged) {
      setEditingId(null);
      setEditDraft(null);
      return;
    }

    const body = buildContentUpdateBody(post, editDraft);
    if (!body) {
      const message = 'This post has no media and cannot be updated here.';
      setError(message);
      pushFlashFeedback({
        variant: 'error',
        title: 'Update failed',
        description: message,
      });
      return;
    }

    setItemSaving(true);
    setError(null);
    try {
      const updated = await updateCreatorContent(post.id, body);
      setPosts((current) =>
        current.map((item) => (item.id === post.id ? { ...item, ...updated } : item))
      );
      setEditingId(null);
      setEditDraft(null);
      pushFlashFeedback({
        variant: 'success',
        title: 'Portfolio content updated',
      });
    } catch (e) {
      const message = getApiErrorMessage(e, 'Unable to update this content.');
      setError(message);
      pushFlashFeedback({
        variant: 'error',
        title: 'Update failed',
        description: message,
      });
    } finally {
      setItemSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const shellClass =
    '-mx-5 -mb-1 -mt-5 bg-neutral-100/80 px-5 py-5 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-6 dark:bg-neutral-950/60';

  const cards = (
    <div className="grid gap-4 sm:grid-cols-2">
      {selectedPosts.map((post, index) => {
        const title = post.title?.trim() || 'Untitled';
        const genre = post.genre?.trim() || null;
        const description = post.description?.trim() || null;
        const confirmingDelete = pendingDeleteId === post.id;
        const editing = editingId === post.id && editDraft != null;
        const draft = editDraft;
        const draftChanged =
          editing &&
          draft != null &&
          (draft.title.trim() !== (post.title ?? '').trim() ||
            draft.genre.trim() !== (post.genre ?? '').trim() ||
            draft.description.trim() !== (post.description ?? '').trim());
        const showCardChrome = !editing;
        const showReorder = showCardChrome && !confirmingDelete;

        return (
          <article
            key={post.id}
            ref={editing ? editingCardRef : undefined}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-[#121212]"
          >
            <div className="relative">
              <ShowcaseThumbnail mediaUrl={post.mediaUrl} showOrder={false} />
              {editing && draft ? (
                <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5">
                  <IconButton
                    label={draftChanged ? 'Confirm changes' : 'No changes'}
                    tone={draftChanged ? 'confirm' : 'neutral'}
                    disabled={busy}
                    onClick={() => void confirmEdit(post)}
                  >
                    {itemSaving && editingId === post.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                    )}
                  </IconButton>
                  <IconButton label="Cancel" tone="cancel" disabled={busy} onClick={cancelEdit}>
                    <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                  </IconButton>
                </div>
              ) : showCardChrome ? (
                <div
                  className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 ${
                    confirmingDelete ? 'opacity-100' : cardActionVisibilityClass
                  }`}
                >
                  {confirmingDelete ? (
                    <>
                      <IconButton
                        label="Confirm remove"
                        tone="confirm"
                        disabled={busy}
                        onClick={() => void removePost(post.id)}
                      >
                        {removingId === post.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                        )}
                      </IconButton>
                      <IconButton
                        label="Cancel"
                        tone="cancel"
                        disabled={busy}
                        onClick={() => setPendingDeleteId(null)}
                      >
                        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        label="Edit content"
                        disabled={busy}
                        onClick={() => startEdit(post)}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                      </IconButton>
                      <IconButton
                        label="Remove from portfolio"
                        tone="danger"
                        disabled={busy}
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft(null);
                          setPendingDeleteId(post.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" fixedWidth />
                      </IconButton>
                    </>
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  {editing && draft ? (
                    <>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(event) =>
                          setEditDraft((current) =>
                            current ? { ...current, title: event.target.value } : current
                          )
                        }
                        placeholder="Title"
                        className={`${portfolioInlineInputClass} w-full text-base font-bold`}
                        autoFocus
                        disabled={busy}
                      />
                      <input
                        type="text"
                        value={draft.genre}
                        onChange={(event) =>
                          setEditDraft((current) =>
                            current ? { ...current, genre: event.target.value } : current
                          )
                        }
                        placeholder="Genre"
                        className={`${portfolioInlineInputClass} w-full text-xs font-semibold uppercase tracking-[0.08em]`}
                        disabled={busy}
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold tracking-[-0.02em] text-neutral-950 dark:text-white">
                        {title}
                      </p>
                      {genre ? (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          {genre}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>

                {showReorder ? (
                  <div
                    className={`inline-flex shrink-0 items-center gap-1.5 ${
                      confirmingDelete || editing ? 'opacity-100' : cardActionVisibilityClass
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void move(index, -1)}
                      disabled={busy || index === 0}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      aria-label="Move earlier"
                      title="Move earlier"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => void move(index, 1)}
                      disabled={busy || index >= selectedPosts.length - 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      aria-label="Move later"
                      title="Move later"
                    >
                      ↓
                    </button>
                  </div>
                ) : null}
              </div>

              {editing && draft ? (
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    setEditDraft((current) =>
                      current ? { ...current, description: event.target.value } : current
                    )
                  }
                  rows={4}
                  placeholder="Description"
                  className={`${portfolioInlineInputClass} w-full resize-y text-sm leading-relaxed`}
                  disabled={busy}
                />
              ) : description ? (
                <p className="line-clamp-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {description}
                </p>
              ) : (
                <p className="text-sm italic text-neutral-400">No description</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );

  const showInteractiveShell = composeAdd || editingId != null;

  if (!showInteractiveShell && selectedPosts.length === 0) {
    return (
      <div className={`${shellClass} py-5`}>
        <ProfileSectionItemCount
          count={0}
          limit={MAX_PORTFOLIO_PICKS}
          unit="portfolio posts"
          className="mb-6"
        />
        <p className="text-center text-sm italic text-neutral-500 dark:text-neutral-400">
          No content selected yet. Click Add content to showcase up to{' '}
          {MAX_PORTFOLIO_PICKS} published posts.
        </p>
      </div>
    );
  }

  if (!showInteractiveShell) {
    return (
      <div className={shellClass}>
        <ProfileSectionItemCount
          count={selectedIds.length}
          limit={MAX_PORTFOLIO_PICKS}
          unit="portfolio posts"
          className="mb-4"
        />
        {cards}
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <ProfileSectionItemCount
        count={selectedIds.length}
        limit={MAX_PORTFOLIO_PICKS}
        unit="portfolio posts"
        className="mb-4"
      />
      {error ? (
        <div className="mb-4">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {editingId ? (
            <span className="text-neutral-500">Editing — confirm on the card, or cancel.</span>
          ) : composeAdd ? (
            <span className="text-neutral-500">Choose a post to add.</span>
          ) : (
            <span>
              Selected {selectedIds.length}/{MAX_PORTFOLIO_PICKS}.
            </span>
          )}
        </p>
      </div>

      {showPicker ? (
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-[#121212] sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Your published posts
            </p>
            <button
              type="button"
              disabled={saving}
              onClick={() => onPickerOpenChange?.(false)}
              className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
            >
              Close
            </button>
          </div>
          {availableToPick.length === 0 ? (
            <p className="py-4 text-sm italic text-neutral-500 dark:text-neutral-400">
              All your public posts are already selected, or you have no active publications.
            </p>
          ) : (
            <div className="max-h-80 divide-y divide-neutral-200/50 overflow-y-auto dark:divide-white/[0.06]">
              {availableToPick.map((post) => {
                const pickTitle = post.title?.trim() || 'Untitled';
                const pickGenre = post.genre?.trim() || null;
                const pickDescription = post.description?.trim() || null;
                return (
                  <div key={post.id} className="flex items-start gap-4 py-4">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      {post.mediaUrl ? (
                        <ProductThumbnailMedia
                          url={post.mediaUrl}
                          alt=""
                          fit="cover"
                          className="h-full w-full"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-neutral-400">
                          Preview
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-neutral-900 dark:text-white">
                        {pickTitle}
                      </p>
                      {pickGenre ? (
                        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
                          {pickGenre}
                        </p>
                      ) : null}
                      {pickDescription ? (
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
                          {pickDescription}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs italic text-neutral-400">No description</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void addPost(post.id)}
                      className="shrink-0 text-sm font-semibold text-[#EA580C] hover:text-[#C2410C] disabled:opacity-50"
                    >
                      Choose
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {selectedPosts.length === 0 ? (
        <p className="py-8 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
          Nothing selected yet.
          {posts.length === 0 ? (
            <>
              {' '}
              <Link
                href="/dashboard/creator?tab=content"
                className="font-semibold text-[#EA580C] hover:text-[#C2410C]"
              >
                Publish content
              </Link>{' '}
              first.
            </>
          ) : (
            ' Use Add content to pick posts.'
          )}
        </p>
      ) : (
        cards
      )}

      {busy ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
          <LoadingSpinner size="sm" />
          Saving…
        </div>
      ) : null}
    </div>
  );
}
