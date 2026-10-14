'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ContentPostActionsMenu, PostMenuIcons, type ContentPostActionItem } from '@/components/creator/ContentPostActionsMenu';
import {
  ContentPostDialogShell,
  DIALOG_PRIMARY_BUTTON,
  DIALOG_SECONDARY_BUTTON,
} from '@/components/creator/ContentPostDialogShell';
import { NewsFeedPostCard } from '@/components/home/NewsFeedPostCard';
import { SavedCollectionCoverArt } from '@/components/home/SavedCollectionCover';
import { SAVED_COLLECTION_NAME_MAX, SAVED_COLLECTIONS_CHANGE_EVENT } from '@/components/home/SaveToCollectionDialog';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  addPostToSavedCollection,
  createSavedCollection,
  deleteSavedCollection,
  getSavedCollections,
  listSavedCollectionPosts,
  listSavedContent,
  removePostFromSavedCollection,
  renameSavedCollection,
  type SavedCollection,
  type SavedCollectionsOverview,
} from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import type { PublicContentFeedItem } from '@/types/marketplace';
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS, SettingsSectionHeader, Spinner } from './settingsUi';
import { useT } from '@/lib/i18n/I18nProvider';
import type { Translator } from '@/lib/i18n/translate';

const PAGE_SIZE = 10;
/** `?collection=` value of the "All saved" view. */
export const ALL_SAVED = 'all';

function postCount(t: Translator, n: number) {
  return t.plural(n, '{count} post', '{count} posts', { count: t.number(n) });
}

/**
 * Settings → Saved posts. Two environments, both addressable (`?collection=` keeps Back working):
 *  - the library — "All saved" plus every collection, as cover tiles, and a "New collection" tile;
 *  - one shelf — All saved or a single collection, its posts as feed cards, with rename / delete.
 * Collections only organise saved posts: deleting one never unsaves anything.
 */
export function SavedPostsSettingsSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shelf = searchParams.get('collection');

  const navigate = useCallback(
    (collection: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (collection) params.set('collection', collection);
      else params.delete('collection');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      window.scrollTo({ top: 0 });
    },
    [pathname, router, searchParams]
  );

  return (
    /* The settings page root already carries the News scope (`news-theme news-feed news-mono`), so the
       shelf's post cards are the exact News cards. */
    <div>
      {shelf ? (
        <SavedShelf key={shelf} shelfId={shelf} onBack={() => navigate(null)} />
      ) : (
        <SavedLibrary onOpen={navigate} />
      )}
    </div>
  );
}

/* ─────────────────────────────── Library ─────────────────────────────── */

function SavedLibrary({ onOpen }: { onOpen: (collection: string) => void }) {
  const t = useT();
  const [overview, setOverview] = useState<SavedCollectionsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  /* The collections API is missing (older backend) or failing — the shelf still lists saved posts. */
  const [unavailable, setUnavailable] = useState(false);
  const [creating, setCreating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getSavedCollections()
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
        setUnavailable(false);
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    const refresh = () => setReloadKey((k) => k + 1);
    window.addEventListener(SAVED_COLLECTIONS_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(SAVED_COLLECTIONS_CHANGE_EVENT, refresh);
  }, []);

  if (loading) return <LibrarySkeleton />;

  if (unavailable || !overview) {
    /* No collections to show — fall back to the plain list so saved posts are never out of reach. */
    return <SavedShelf shelfId={ALL_SAVED} standalone />;
  }

  const { allSavedCount, allSavedCovers, collections } = overview;
  const isEmpty = allSavedCount === 0 && collections.length === 0;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-6">
        <div className="min-w-0 flex-1 basis-80 [&>header]:mb-0">
          <SettingsSectionHeader
            title={t('Saved posts')}
            description={t('Everything you bookmarked from News. Group posts into collections — moodboards, references, people to hire.')}
          />
        </div>
        <div className="px-4 sm:px-0">
          <button type="button" onClick={() => setCreating(true)} className={PRIMARY_BUTTON_CLASS}>
            <PlusGlyph className="h-4 w-4" />
            {t('New collection')}
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="gn-card px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--gn-inset)] text-[color:var(--gn-ink)]">
            <BookmarkGlyph className="h-5 w-5" />
          </span>
          <p className="mt-4 text-[17px] font-semibold leading-[22px] text-[color:var(--gn-ink)]">{t('Nothing saved yet')}</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-5 text-[color:var(--gn-ink2)]">
            {t('Tap the bookmark on any post in News to keep it here, then sort it into a collection.')}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 sm:px-0" aria-label={t('Collections')}>
          <li>
            <CollectionTile
              name="All saved"
              count={allSavedCount}
              covers={allSavedCovers}
              onOpen={() => onOpen(ALL_SAVED)}
            />
          </li>
          {collections.map((collection) => (
            <li key={collection.id}>
              <CollectionTile
                name={collection.name}
                count={collection.itemCount}
                covers={collection.covers}
                onOpen={() => onOpen(collection.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {creating ? (
        <CollectionNameDialog
          mode="create"
          onClose={() => setCreating(false)}
          onSubmit={async (name) => {
            const created = await createSavedCollection(name);
            setOverview((prev) => (prev ? { ...prev, collections: [created, ...prev.collections] } : prev));
            pushFlashFeedback({
              variant: 'success',
              title: t('“{name}” created', { name: created.name }),
              description: t('File posts from their menu, or right after saving them.'),
            });
          }}
        />
      ) : null}
    </>
  );
}

function CollectionTile({
  name,
  count,
  covers,
  onOpen,
}: {
  name: string;
  count: number;
  covers: SavedCollection['covers'];
  onOpen: () => void;
}) {
  const t = useT();
  return (
    <button type="button" onClick={onOpen} className="group/tile block w-full text-start focus-visible:outline-none">
      <span className="relative block overflow-hidden bg-[color:var(--gn-surface)] group-focus-visible/tile:ring-2 group-focus-visible/tile:ring-[color:var(--gn-ring)] group-focus-visible/tile:ring-offset-2">
        <SavedCollectionCoverArt
          covers={covers}
          size={260}
          className="aspect-square w-full transition-transform duration-500 ease-out group-hover/tile:scale-[1.03]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/tile:bg-black/[0.06]"
        />
      </span>
      <span className="mt-2.5 block truncate text-[15px] font-bold leading-5 text-[color:var(--gn-ink)]">{name}</span>
      <span className="mt-0.5 block text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{postCount(t, count)}</span>
    </button>
  );
}

function LibrarySkeleton() {
  const t = useT();
  return (
    <div aria-busy="true" aria-label={t('Loading saved posts')}>
      <div className="mb-6 px-4 sm:px-0">
        <div className="h-8 w-48 bg-[color:var(--gn-surface)]" />
        <div className="mt-3 h-4 w-80 max-w-full bg-[color:var(--gn-surface)]" />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 sm:px-0">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="aspect-square w-full animate-pulse bg-[color:var(--gn-surface)]" />
            <div className="mt-3 h-4 w-28 bg-[color:var(--gn-surface)]" />
            <div className="mt-2 h-3 w-16 bg-[color:var(--gn-surface)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────── Strip ──────────────────────────────── */

/**
 * The library as one horizontal strip, for the News page's Saved view (HomeNewsFeed): "All saved",
 * every collection — cover, name, count — then "New collection", 112px tiles that scroll sideways
 * (five and a bit fit the 680px feed, so the cut-off one says there is more). The open one carries
 * an ink outline. Renders nothing when the collections API is unavailable: the shelf below still
 * lists every saved post.
 */
export function SavedCollectionsStrip({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (collection: string) => void;
}) {
  const t = useT();
  const [overview, setOverview] = useState<SavedCollectionsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getSavedCollections()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch(() => {
        if (!cancelled) setOverview(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    const refresh = () => setReloadKey((k) => k + 1);
    window.addEventListener(SAVED_COLLECTIONS_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(SAVED_COLLECTIONS_CHANGE_EVENT, refresh);
  }, []);

  /* `py-1` (and `-mx-1 px-1` from sm) keeps the 2px + 2px outline of the open tile inside the
     scroller, which clips both ways; the tiles still line up with the cards' left edge. */
  const rail = 'flex gap-3 overflow-x-auto px-4 py-1 sm:-mx-1 sm:px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

  if (loading) {
    return (
      <div className={rail} aria-busy="true" aria-label={t('Loading collections')}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-28 shrink-0">
            <div className="aspect-square w-full animate-pulse bg-[color:var(--gn-surface)]" />
            <div className="mt-2.5 h-3.5 w-20 bg-[color:var(--gn-surface)]" />
            <div className="mt-1.5 h-3 w-12 bg-[color:var(--gn-surface)]" />
          </div>
        ))}
      </div>
    );
  }

  if (!overview) return null;

  return (
    <>
      <ul className={rail} aria-label={t('Collections')}>
        <li className="shrink-0">
          <StripTile
            name="All saved"
            count={overview.allSavedCount}
            covers={overview.allSavedCovers}
            active={selected === ALL_SAVED}
            onOpen={() => onSelect(ALL_SAVED)}
          />
        </li>
        {overview.collections.map((collection) => (
          <li key={collection.id} className="shrink-0">
            <StripTile
              name={collection.name}
              count={collection.itemCount}
              covers={collection.covers}
              active={selected === collection.id}
              onOpen={() => onSelect(collection.id)}
            />
          </li>
        ))}
        <li className="shrink-0">
          <button type="button" onClick={() => setCreating(true)} className="group/tile block w-28 text-left focus-visible:outline-none">
            <span className="flex aspect-square w-full items-center justify-center border border-dashed border-[color:var(--gn-ink3)] text-[color:var(--gn-ink2)] transition-colors group-hover/tile:border-[color:var(--gn-ink)] group-hover/tile:text-[color:var(--gn-ink)] group-focus-visible/tile:outline group-focus-visible/tile:outline-2 group-focus-visible/tile:outline-offset-2 group-focus-visible/tile:outline-[color:var(--gn-ring)]">
              <PlusGlyph className="h-6 w-6" />
            </span>
            <span className="mt-2 block truncate text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">{t('New collection')}</span>
          </button>
        </li>
      </ul>

      {creating ? (
        <CollectionNameDialog
          mode="create"
          onClose={() => setCreating(false)}
          onSubmit={async (name) => {
            const created = await createSavedCollection(name);
            setOverview((prev) => (prev ? { ...prev, collections: [created, ...prev.collections] } : prev));
            pushFlashFeedback({
              variant: 'success',
              title: t('“{name}” created', { name: created.name }),
              description: t('File posts from their menu, or right after saving them.'),
            });
          }}
        />
      ) : null}
    </>
  );
}

function StripTile({
  name,
  count,
  covers,
  active,
  onOpen,
}: {
  name: string;
  count: number;
  covers: SavedCollection['covers'];
  active: boolean;
  onOpen: () => void;
}) {
  const t = useT();
  return (
    <button type="button" onClick={onOpen} aria-pressed={active} className="group/tile block w-28 text-start focus-visible:outline-none">
      <span
        className={`relative block overflow-hidden bg-[color:var(--gn-surface)] outline-offset-2 ${
          active
            ? 'outline outline-2 outline-[color:var(--gn-ink)]'
            : 'group-focus-visible/tile:outline group-focus-visible/tile:outline-2 group-focus-visible/tile:outline-[color:var(--gn-ring)]'
        }`}
      >
        <SavedCollectionCoverArt
          covers={covers}
          size={112}
          className="aspect-square w-full transition-transform duration-500 ease-out group-hover/tile:scale-[1.03]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/tile:bg-black/[0.06]"
        />
      </span>
      <span className={`mt-2 block truncate text-[14px] leading-5 text-[color:var(--gn-ink)] ${active ? 'font-bold' : 'font-semibold'}`}>
        {name}
      </span>
      <span className="block text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{postCount(t, count)}</span>
    </button>
  );
}

/* ──────────────────────────────── Shelf ──────────────────────────────── */

type ShelfMeta = { name: string; count: number; collection: SavedCollection | null };

export function SavedShelf({
  shelfId,
  onBack,
  standalone = false,
  embedded = false,
}: {
  shelfId: string;
  /** Leaves the shelf — the back button, and where "not found" and a deleted collection go. */
  onBack?: () => void;
  /** Collections are unavailable: this is the whole page, with the section's own header. */
  standalone?: boolean;
  /**
   * Under the collections strip in the News page's Saved view: the strip already names and marks
   * the open shelf, so the header shrinks to one line — "Name · 12 posts" and the collection menu.
   */
  embedded?: boolean;
}) {
  const t = useT();
  const isAll = shelfId === ALL_SAVED;
  const [items, setItems] = useState<PublicContentFeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [meta, setMeta] = useState<ShelfMeta | null>(isAll ? { name: 'All saved', count: 0, collection: null } : null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchPage = useCallback(
    (pageIndex: number) =>
      isAll
        ? listSavedContent({ page: pageIndex, size: PAGE_SIZE })
        : listSavedCollectionPosts(shelfId, { page: pageIndex, size: PAGE_SIZE }),
    [isAll, shelfId]
  );

  // First page (and the collection's name): the promise callbacks set state, never the effect body.
  useEffect(() => {
    let cancelled = false;
    const metaRequest = isAll || standalone ? Promise.resolve(null) : getSavedCollections();
    Promise.all([fetchPage(0), metaRequest])
      .then(([result, overview]) => {
        if (cancelled) return;
        setItems(result.content);
        setPage(0);
        setHasMore(!result.last);
        setTotal(result.totalElements);
        if (overview) {
          const collection = overview.collections.find((c) => c.id === shelfId) ?? null;
          if (!collection) setNotFound(true);
          else setMeta({ name: collection.name, count: collection.itemCount, collection });
        }
      })
      .catch((e) => {
        if (cancelled) return;
        const status = (e as { response?: { status?: number } })?.response?.status;
        if (status === 404 && !isAll) setNotFound(true);
        else setError(getApiErrorMessage(e, t('Unable to load these posts.')));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPage, isAll, reloadKey, shelfId, standalone, t]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchPage(page + 1);
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...result.content.filter((p) => !seen.has(p.id))];
      });
      setPage(page + 1);
      setHasMore(!result.last);
    } catch (e) {
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to load more posts')) });
    } finally {
      setLoadingMore(false);
    }
  };

  /* Undo for "Remove from this collection" — puts the card back where it was. */
  const removedRef = useRef(new Map<string, { post: PublicContentFeedItem; index: number }>());

  const removeFromCollection = async (post: PublicContentFeedItem) => {
    if (isAll) return;
    const index = items.findIndex((p) => p.id === post.id);
    setItems((prev) => prev.filter((p) => p.id !== post.id));
    setTotal((t) => (t === null ? t : Math.max(0, t - 1)));
    removedRef.current.set(post.id, { post, index });
    try {
      await removePostFromSavedCollection(shelfId, post.id);
      window.dispatchEvent(new Event(SAVED_COLLECTIONS_CHANGE_EVENT));
      pushFlashFeedback({
        variant: 'success',
        title: `Removed from “${meta?.name ?? 'collection'}”`,
        description: t('It stays in All saved.'),
        actionLabel: t('Undo'),
        onAction: () => {
          const entry = removedRef.current.get(post.id);
          if (!entry) return;
          removedRef.current.delete(post.id);
          void addPostToSavedCollection(shelfId, post.id)
            .then(() => {
              setItems((prev) => {
                if (prev.some((p) => p.id === post.id)) return prev;
                const next = [...prev];
                next.splice(entry.index < 0 ? 0 : Math.min(entry.index, next.length), 0, entry.post);
                return next;
              });
              setTotal((t) => (t === null ? t : t + 1));
              window.dispatchEvent(new Event(SAVED_COLLECTIONS_CHANGE_EVENT));
            })
            .catch((e) =>
              pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to put it back')) })
            );
        },
      });
    } catch (e) {
      setItems((prev) => {
        if (prev.some((p) => p.id === post.id)) return prev;
        const next = [...prev];
        next.splice(index < 0 ? 0 : Math.min(index, next.length), 0, post);
        return next;
      });
      setTotal((t) => (t === null ? t : t + 1));
      removedRef.current.delete(post.id);
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to remove it from the collection')) });
    }
  };

  const shelfMenu = useMemo<ContentPostActionItem[]>(
    () => [
      {
        id: 'rename',
        label: t('Rename collection'),
        icon: <PencilGlyph />,
        onSelect: () => setRenaming(true),
      },
      {
        id: 'delete',
        label: t('Delete collection'),
        description: t('Its posts stay in All saved.'),
        icon: PostMenuIcons.trash,
        tone: 'danger',
        separated: true,
        onSelect: () => setDeleting(true),
      },
    ],
    [t]
  );

  const count = total ?? meta?.count ?? 0;
  const title = isAll ? t('All saved') : meta?.name ?? '';

  /* Cards at the feed's own width (680) — wider media would only blur the posts. */
  return (
    <div className="max-w-[680px]">
      {standalone ? (
        <SettingsSectionHeader
          title={t('Saved posts')}
          description={t('Everything you bookmarked from News. Tap the bookmark on a post to remove it.')}
        />
      ) : embedded ? (
        <header className="mb-3 flex min-h-9 items-center gap-3 px-4 sm:px-1">
          <p className="min-w-0 flex-1 truncate text-[14px] leading-5 text-[color:var(--gn-ink2)]">
            {loading && !meta ? null : notFound ? (
              t('Collection not found')
            ) : (
              <>
                <span className="font-semibold text-[color:var(--gn-ink)]">{title}</span>
                {loading ? null : ` · ${postCount(t, count)}`}
              </>
            )}
          </p>
          {!isAll && meta?.collection && !notFound ? (
            <ContentPostActionsMenu items={shelfMenu} className="shrink-0" />
          ) : null}
        </header>
      ) : (
        <header className="mb-4 px-4 sm:mb-6 sm:px-0">
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1.5 pr-3 text-[14px] font-semibold leading-5 text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m14.5 6-6 6 6 6" />
            </svg>
            {t('Saved posts')}
          </button>
          <div className="mt-3 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {loading && !meta ? (
                <div className="h-8 w-56 max-w-full bg-[color:var(--gn-surface)]" />
              ) : (
                <h2 className="break-words text-[24px] font-extrabold leading-[30px] tracking-[-0.015em] text-[color:var(--gn-ink)]">
                  {notFound ? t('Collection not found') : title}
                </h2>
              )}
              {!notFound ? (
                <p className="mt-1 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
                  {loading ? ' ' : postCount(t, count)}
                  {!isAll && !loading ? <span className="text-[color:var(--gn-ink3)]"> {t('· Removing a post here keeps it saved')}</span> : null}
                </p>
              ) : null}
            </div>
            {!isAll && meta?.collection && !notFound ? (
              <ContentPostActionsMenu items={shelfMenu} className="mt-0.5 shrink-0" />
            ) : null}
          </div>
        </header>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-[color:var(--gn-ink2)]">
          <Spinner className="h-5 w-5" />
        </div>
      ) : notFound ? (
        <EmptyState
          title={t('This collection no longer exists')}
          body={t('It may have been deleted from another device. Your saved posts are still in All saved.')}
          action={
            <button type="button" onClick={onBack} className={SECONDARY_BUTTON_CLASS}>
              {embedded ? t('Show all saved') : t('Back to Saved posts')}
            </button>
          }
        />
      ) : error ? (
        <div className="gn-card flex flex-col items-start gap-4 px-6 py-8">
          <p className="text-[14px] leading-5 text-[color:var(--gn-ink2)]">{error}</p>
          <button type="button" onClick={retry} className={SECONDARY_BUTTON_CLASS}>
            {t('Try again')}
          </button>
        </div>
      ) : items.length === 0 ? (
        isAll ? (
          <EmptyState
            title={t('Nothing saved yet')}
            body={t('Tap the bookmark on any post in News to keep it here.')}
          />
        ) : (
          <EmptyState
            title={t('No posts in this collection yet')}
            body={t('Open a post’s menu and choose “Add to collection”, or use the button that appears right after you save one.')}
          />
        )
      ) : (
        <>
          <div className="space-y-2 sm:space-y-5">
            {items.map((post) => (
              <NewsFeedPostCard
                key={post.id}
                post={post}
                onReposted={() => {}}
                extraMenuItems={
                  isAll
                    ? undefined
                    : [
                        {
                          id: 'remove-from-collection',
                          label: t('Remove from this collection'),
                          description: t('It stays in All saved.'),
                          icon: PostMenuIcons.collectionRemove,
                          onSelect: () => void removeFromCollection(post),
                        },
                      ]
                }
              />
            ))}
          </div>
          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <button type="button" disabled={loadingMore} onClick={() => void loadMore()} className={SECONDARY_BUTTON_CLASS}>
                {loadingMore ? t('Loading…') : t('Load more')}
              </button>
            </div>
          ) : null}
        </>
      )}

      {renaming && meta?.collection ? (
        <CollectionNameDialog
          mode="rename"
          initialName={meta.name}
          onClose={() => setRenaming(false)}
          onSubmit={async (name) => {
            const updated = await renameSavedCollection(shelfId, name);
            setMeta({ name: updated.name, count: updated.itemCount, collection: updated });
            window.dispatchEvent(new Event(SAVED_COLLECTIONS_CHANGE_EVENT));
            pushFlashFeedback({ variant: 'success', title: t('Collection renamed') });
          }}
        />
      ) : null}

      {deleting && meta?.collection ? (
        <DeleteCollectionDialog
          name={meta.name}
          count={count}
          onClose={() => setDeleting(false)}
          onConfirm={async () => {
            await deleteSavedCollection(shelfId);
            window.dispatchEvent(new Event(SAVED_COLLECTIONS_CHANGE_EVENT));
            pushFlashFeedback({
              variant: 'success',
              title: t('“{name}” deleted', { name: meta.name }),
              description: t('Its posts are still in All saved.'),
            });
            onBack?.();
          }}
        />
      ) : null}
    </div>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="gn-card px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--gn-inset)] text-[color:var(--gn-ink)]">
        <BookmarkGlyph className="h-5 w-5" />
      </span>
      <p className="mt-4 text-[17px] font-semibold leading-[22px] text-[color:var(--gn-ink)]">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-5 text-[color:var(--gn-ink2)]">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* ─────────────────────────────── Dialogs ─────────────────────────────── */

function CollectionNameDialog({
  mode,
  initialName = '',
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'rename';
  initialName?: string;
  onClose: () => void;
  /** Throws to keep the dialog open with the server's message (e.g. a name already in use). */
  onSubmit: (name: string) => Promise<void>;
}) {
  const t = useT();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = name.trim().replace(/\s+/g, ' ');
  const unchanged = mode === 'rename' && trimmed === initialName;

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, []);

  const submit = async () => {
    if (!trimmed || unchanged || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, mode === 'create' ? t('Unable to create the collection.') : t('Unable to rename the collection.')));
      setBusy(false);
    }
  };

  return (
    <ContentPostDialogShell open title={mode === 'create' ? t('New collection') : t('Rename collection')} onClose={onClose} busy={busy}>
      <form
        className="px-5 pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label htmlFor="collection-name" className="block text-[13px] font-semibold leading-[18px] text-[#536471] dark:text-[#71767B]">
          {t('Name')}
        </label>
        <input
          ref={inputRef}
          id="collection-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value.slice(0, SAVED_COLLECTION_NAME_MAX));
            setError(null);
          }}
          placeholder={t('e.g. Moodboard, Logo references, To hire')}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby="collection-name-help"
          className="mt-2 h-11 w-full rounded-xl bg-[#EFF3F4] px-4 text-[15px] text-[#0F1419] outline-none placeholder:text-[#536471] focus:ring-2 focus:ring-[#0F1419] aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[#F4212E] dark:bg-[#202327] dark:text-[#E7E9EA] dark:placeholder:text-[#71767B] dark:focus:ring-[#E7E9EA]"
        />
        <div id="collection-name-help" className="mt-1.5 flex justify-between gap-4 text-[12px] leading-4">
          <span className="text-[#F4212E]" role={error ? 'alert' : undefined}>
            {error ?? ''}
          </span>
          <span className="shrink-0 tabular-nums text-[#536471] dark:text-[#71767B]">
            {name.length}/{SAVED_COLLECTION_NAME_MAX}
          </span>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className={DIALOG_SECONDARY_BUTTON}>
            {t('Cancel')}
          </button>
          <button type="submit" disabled={!trimmed || unchanged || busy} className={DIALOG_PRIMARY_BUTTON}>
            {busy ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : null}
            {mode === 'create' ? t('Create') : t('Save')}
          </button>
        </div>
      </form>
    </ContentPostDialogShell>
  );
}

function DeleteCollectionDialog({
  name,
  count,
  onClose,
  onConfirm,
}: {
  name: string;
  count: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to delete the collection.')));
      setBusy(false);
    }
  };

  return (
    <ContentPostDialogShell open title={t('Delete collection?')} onClose={onClose} busy={busy}>
      <div className="px-5 pb-5">
        <p className="text-[15px] leading-[22px] text-[#536471] dark:text-[#71767B]">
          {t.rich('{name} will be deleted.', {
            name: <span className="font-bold text-[#0F1419] dark:text-[#E7E9EA]">“{name}”</span>,
          })}
          {count > 0
            ? ` ${t.plural(
                count,
                'Its {count} post stays saved — you’ll find it in All saved.',
                'Its {count} posts stay saved — you’ll find them in All saved.',
              )}`
            : ''}
        </p>
        {error ? (
          <p className="mt-3 text-[13px] leading-[18px] text-[#F4212E]" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className={DIALOG_SECONDARY_BUTTON}>
            {t('Cancel')}
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#F4212E] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#DC1D29] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : null}
            {t('Delete collection')}
          </button>
        </div>
      </div>
    </ContentPostDialogShell>
  );
}

/* ─────────────────────────────── Glyphs ──────────────────────────────── */

function PlusGlyph({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function BookmarkGlyph({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden>
      <path d="M6.5 3.5h11a1 1 0 0 1 1 1V20l-6.5-4.2L5.5 20V4.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function PencilGlyph() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}
