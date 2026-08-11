'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  addFavorite,
  getReactionCounts,
  removeFavorite,
  removeReaction,
  setReaction,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ShareButtons } from '@/components/marketplace/ShareButtons';
import type { SocialTargetType } from '@/types/marketplace';

type ProductSocialBarProps = {
  targetType: SocialTargetType;
  targetId: string;
  shareUrl: string;
  shareTitle: string;
  isAuthenticated: boolean;
  loginRedirect: string;
};

export function ProductSocialBar({
  targetType,
  targetId,
  shareUrl,
  shareTitle,
  isAuthenticated,
  loginRedirect,
}: ProductSocialBarProps) {
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const counts = await getReactionCounts(targetType, targetId);
      setLikes(counts.likes);
      setUserLiked(counts.userReaction === 'LIKE');
      setFavorited(counts.favorited);
    } catch {
      // counts may be unavailable before backend is ready
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const requireAuth = () => {
    if (!isAuthenticated) return false;
    return true;
  };

  const onLike = async () => {
    if (!requireAuth()) return;
    setBusy(true);
    setError(null);
    try {
      if (userLiked) {
        await removeReaction(targetType, targetId);
        setUserLiked(false);
        setLikes((n) => Math.max(0, n - 1));
      } else {
        await setReaction(targetType, targetId, 'LIKE');
        setUserLiked(true);
        setLikes((n) => n + 1);
      }
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to update like.'));
    } finally {
      setBusy(false);
    }
  };

  const onFavorite = async () => {
    if (!requireAuth()) return;
    setBusy(true);
    setError(null);
    try {
      if (favorited) {
        await removeFavorite(targetType, targetId);
        setFavorited(false);
      } else {
        await addFavorite(targetType, targetId);
        setFavorited(true);
      }
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to update favorite.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-500">Loading interactions…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        {!isAuthenticated ? (
          <Link
            href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Sign in to like or favorite
          </Link>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onLike()}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                userLiked
                  ? 'bg-orange-100 text-orange-800'
                  : 'border border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50'
              }`}
            >
              {userLiked ? '♥ Liked' : '♡ Like'}
              <span className="text-xs text-gray-500">({likes})</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onFavorite()}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                favorited
                  ? 'bg-amber-100 text-amber-900'
                  : 'border border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50'
              }`}
            >
              {favorited ? '★ Saved' : '☆ Save'}
            </button>
          </>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Share</p>
        <ShareButtons
          targetType={targetType}
          targetId={targetId}
          shareUrl={shareUrl}
          shareTitle={shareTitle}
          isAuthenticated={isAuthenticated}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
