'use client';

import { trPlural } from '@/lib/i18n/active';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ContentPostDialogShell,
  DIALOG_PRIMARY_BUTTON,
} from '@/components/creator/ContentPostDialogShell';
import { SAVED_POST_CHANGE_EVENT, type SavedPostChangeDetail } from '@/components/creator/ContentPostSocialBar';
import { SavedCollectionCoverArt } from '@/components/home/SavedCollectionCover';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  addPostToSavedCollection,
  createSavedCollection,
  getSavedCollectionIdsForPost,
  getSavedCollections,
  removePostFromSavedCollection,
  type SavedCollection,
} from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { useT } from '@/lib/i18n/I18nProvider';

export const SAVED_COLLECTION_NAME_MAX = 60;

/** Broadcast when the viewer files / unfiles a post, so the Saved page and cards stay in step. */
export const SAVED_COLLECTIONS_CHANGE_EVENT = 'saved-collections-change';

function announceChange(filedPostId?: string) {
  window.dispatchEvent(new Event(SAVED_COLLECTIONS_CHANGE_EVENT));
  /* Filing saves the post — its bookmark buttons should light up. */
  if (filedPostId) {
    window.dispatchEvent(
      new CustomEvent<SavedPostChangeDetail>(SAVED_POST_CHANGE_EVENT, { detail: { postId: filedPostId, saved: true } })
    );
  }
}

/**
 * "Add to collection" — every collection of the viewer with a tick on the ones holding this post.
 * Ticking files the post (and saves it), unticking takes it out (it stays saved). A new collection
 * can be created inline and receives the post straight away. Changes apply immediately — the
 * dialog has nothing to "submit", so its only button is Done.
 */
export function SaveToCollectionDialog({
  open,
  postId,
  onClose,
}: {
  open: boolean;
  postId: string;
  onClose: () => void;
}) {
  const t = useT();
  const [collections, setCollections] = useState<SavedCollection[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setLoading(true);
      setError(null);
      setCreating(false);
      setDraft('');
      setCreateError(null);
    }
  }

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    Promise.all([getSavedCollections(), getSavedCollectionIdsForPost(postId)])
      .then(([overview, ids]) => {
        if (cancelled) return;
        setCollections(overview.collections);
        setSelected(new Set(ids));
      })
      .catch(() => {
        /* The server's own wording ("resource does not exist") means nothing here. */
        if (!cancelled) setError(t('Collections aren’t available right now. Try again in a moment.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, postId]);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  const toggle = useCallback(
    async (collection: SavedCollection) => {
      if (pending.has(collection.id)) return;
      const wasIn = selected.has(collection.id);
      const flip = (set: Set<string>) => {
        const next = new Set(set);
        if (wasIn) next.delete(collection.id);
        else next.add(collection.id);
        return next;
      };
      setSelected(flip);
      setPending((p) => new Set(p).add(collection.id));
      setCollections((list) =>
        list.map((c) => (c.id === collection.id ? { ...c, itemCount: Math.max(0, c.itemCount + (wasIn ? -1 : 1)) } : c))
      );
      try {
        if (wasIn) await removePostFromSavedCollection(collection.id, postId);
        else await addPostToSavedCollection(collection.id, postId);
        announceChange(wasIn ? undefined : postId);
      } catch (e) {
        setSelected(flip);
        setCollections((list) =>
          list.map((c) => (c.id === collection.id ? { ...c, itemCount: Math.max(0, c.itemCount + (wasIn ? 1 : -1)) } : c))
        );
        pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to update the collection')) });
      } finally {
        setPending((p) => {
          const next = new Set(p);
          next.delete(collection.id);
          return next;
        });
      }
    },
    [pending, postId, selected, t]
  );

  const create = async () => {
    const name = draft.trim();
    if (!name || createBusy) return;
    setCreateBusy(true);
    setCreateError(null);
    try {
      const created = await createSavedCollection(name, postId);
      setCollections((list) => [created, ...list]);
      setSelected((set) => new Set(set).add(created.id));
      setCreating(false);
      setDraft('');
      announceChange(postId);
    } catch (e) {
      setCreateError(getApiErrorMessage(e, t('Unable to create the collection.')));
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <ContentPostDialogShell open={open} title={t('Add to collection')} onClose={onClose} busy={createBusy}>
      <div className="px-3 pb-4">
        {creating ? (
          <form
            className="mx-2 mb-2"
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <label htmlFor="new-collection-name" className="sr-only">
              {t('Collection name')}
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                id="new-collection-name"
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, SAVED_COLLECTION_NAME_MAX))}
                placeholder={t('Collection name')}
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-full bg-black/[0.05] px-4 text-[15px] text-[#111111] outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-black/20 dark:bg-white/[0.08] dark:text-white dark:placeholder:text-neutral-400 dark:focus:ring-white/30"
              />
              <button type="submit" disabled={!draft.trim() || createBusy} className={DIALOG_PRIMARY_BUTTON}>
                {createBusy ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                ) : null}
                {t('Create')}
              </button>
            </div>
            <div className="mt-1.5 flex justify-between px-4 text-[12px] leading-4 text-neutral-500 dark:text-neutral-400">
              <span className="text-red-600 dark:text-red-400" role={createError ? 'alert' : undefined}>
                {createError ?? ''}
              </span>
              <span className="tabular-nums">
                {draft.length}/{SAVED_COLLECTION_NAME_MAX}
              </span>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            disabled={Boolean(error)}
            className="flex h-14 w-full items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-black/[0.04] disabled:opacity-40 dark:hover:bg-white/[0.06]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#111111] text-white dark:bg-white dark:text-[#111111]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold leading-5 text-[#111111] dark:text-white">{t('New collection')}</span>
          </button>
        )}

        {loading ? (
          <div className="space-y-1 px-2 pt-1" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex h-14 items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
                <div className="h-4 w-40 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="px-2 py-4 text-[14px] leading-5 text-neutral-500 dark:text-neutral-400" role="alert">
            {error}
          </p>
        ) : collections.length === 0 && !creating ? (
          <p className="px-2 py-4 text-[14px] leading-5 text-neutral-500 dark:text-neutral-400">
            {t('No collections yet. Create one to group the posts you save — moodboards, references, people to hire.')}
          </p>
        ) : (
          <ul className="space-y-0.5" aria-label={t('Your collections')}>
            {collections.map((collection) => {
              const checked = selected.has(collection.id);
              return (
                <li key={collection.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    disabled={pending.has(collection.id)}
                    onClick={() => void toggle(collection)}
                    className="flex h-14 w-full items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-black/[0.04] disabled:cursor-wait dark:hover:bg-white/[0.06]"
                  >
                    <SavedCollectionCoverArt covers={collection.covers} size={40} className="h-10 w-10 shrink-0 rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold leading-5 text-[#111111] dark:text-white">
                        {collection.name}
                      </span>
                      <span className="block text-[13px] leading-[18px] text-neutral-500 dark:text-neutral-400">
                        {collection.itemCount} {trPlural(collection.itemCount, 'post', 'posts')}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                        checked
                          ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                          : 'ring-[1.5px] ring-inset ring-neutral-300 dark:ring-neutral-600'
                      }`}
                    >
                      {checked ? (
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-3 flex justify-end px-2">
          <button type="button" onClick={onClose} disabled={createBusy} className={DIALOG_PRIMARY_BUTTON}>
            {t('Done')}
          </button>
        </div>
      </div>
    </ContentPostDialogShell>
  );
}
