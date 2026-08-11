'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { listMyContent } from '@/lib/creator-content-api';
import { getCreatorPortfolio, updateCreatorPortfolio } from '@/lib/creator-profile-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import type { CreatorContentItemDto } from '@/types/creator-content';
import {
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionLimitUpgradeHint } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';

export const MAX_PORTFOLIO_PICKS = 3;

type ProfilePortfolioPickerProps = {
  readOnly?: boolean;
};

function SelectedPortfolioCard({
  post,
  order,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  readOnly = false,
}: {
  post: CreatorContentItemDto;
  order: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  readOnly?: boolean;
}) {
  const title = post.title?.trim() || 'Sans titre';

  return (
    <div className="flex gap-3 rounded-xl border border-orange-300/70 bg-orange-50/40 p-3 dark:border-orange-500/35 dark:bg-orange-500/5">
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {post.mediaUrl ? (
          <ProductThumbnailMedia url={post.mediaUrl} alt="" fit="cover" className="h-full w-full" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-neutral-400">Aperçu</span>
        )}
        <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
          {order + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-neutral-900 dark:text-white">{title}</p>
        {post.genre ? (
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
            {post.genre}
          </p>
        ) : null}
        {!readOnly ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="rounded border border-neutral-200 px-2 py-0.5 text-xs disabled:opacity-40 dark:border-neutral-700"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="rounded border border-neutral-200 px-2 py-0.5 text-xs disabled:opacity-40 dark:border-neutral-700"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-700 dark:border-red-500/40 dark:text-red-400"
            >
              Retirer
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ContentPickRow({
  post,
  onPick,
}: {
  post: CreatorContentItemDto;
  onPick: () => void;
}) {
  const title = post.title?.trim() || 'Sans titre';

  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/30 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-orange-500/40"
    >
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {post.mediaUrl ? (
          <ProductThumbnailMedia url={post.mediaUrl} alt="" fit="cover" className="h-full w-full" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-neutral-400">—</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-neutral-900 dark:text-white">{title}</p>
        {post.genre ? (
          <p className="mt-0.5 text-xs uppercase tracking-wide text-neutral-500">{post.genre}</p>
        ) : null}
      </div>
      <span className="shrink-0 self-center text-sm font-semibold text-orange-600 dark:text-orange-400">
        Choisir
      </span>
    </button>
  );
}

export function ProfilePortfolioPicker({ readOnly = false }: ProfilePortfolioPickerProps) {
  const [posts, setPosts] = useState<CreatorContentItemDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

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
      setError(getApiErrorMessage(e, 'Impossible de charger le portfolio.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  const addPost = (id: string) => {
    if (!canAddMore || selectedIds.includes(id)) return;
    setSelectedIds((current) => [...current, id].slice(0, MAX_PORTFOLIO_PICKS));
    setPickerOpen(false);
  };

  const removePost = (id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const move = (index: number, direction: -1 | 1) => {
    setSelectedIds((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const hasChanges = JSON.stringify(selectedIds) !== JSON.stringify(savedIds);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateCreatorPortfolio(selectedIds);
      setSavedIds([...selectedIds]);
      pushFlashFeedback({
        variant: 'success',
        title: 'Portfolio enregistré',
        description: 'Votre sélection est visible sur votre page portfolio publique.',
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Enregistrement impossible.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (readOnly) {
    if (selectedPosts.length === 0) {
      return <p className={profileSectionEmptyClass}>Aucun contenu sélectionné pour le portfolio.</p>;
    }
    return (
      <div className="space-y-3">
        {selectedPosts.map((post, index) => (
          <SelectedPortfolioCard
            key={post.id}
            post={post}
            order={index}
            onRemove={() => undefined}
            onMoveUp={() => undefined}
            onMoveDown={() => undefined}
            canMoveUp={false}
            canMoveDown={false}
            readOnly
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProfileSectionLimitUpgradeHint limit={MAX_PORTFOLIO_PICKS} unit="portfolio posts" />

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            Sélection ({selectedIds.length}/{MAX_PORTFOLIO_PICKS})
          </p>
          {canAddMore ? (
            <button
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              className="rounded-full border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300"
            >
              {pickerOpen ? 'Fermer la liste' : 'Choisir un contenu'}
            </button>
          ) : null}
        </div>

        {selectedPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-5 py-10 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Aucun contenu sélectionné pour le moment.
            </p>
            {posts.length > 0 ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-4 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Choisir depuis mes contenus
              </button>
            ) : (
              <Link
                href="/dashboard/creator?tab=content"
                className="mt-4 inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Publier du contenu
              </Link>
            )}
          </div>
        ) : (
          selectedPosts.map((post, index) => (
            <SelectedPortfolioCard
              key={post.id}
              post={post}
              order={index}
              onRemove={() => removePost(post.id)}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              canMoveUp={index > 0}
              canMoveDown={index < selectedPosts.length - 1}
            />
          ))
        )}
      </div>

      {pickerOpen && canAddMore ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
            Vos contenus publiés
          </p>
          {availableToPick.length === 0 ? (
            <p className={profileSectionMutedTextClass}>
              Tous vos contenus publics sont déjà sélectionnés, ou vous n&apos;avez pas encore de publication
              active.
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {availableToPick.map((post) => (
                <ContentPickRow key={post.id} post={post} onPick={() => addPost(post.id)} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !hasChanges}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? <LoadingSpinner size="sm" /> : null}
          Enregistrer le portfolio
        </button>
      </div>
    </div>
  );
}
