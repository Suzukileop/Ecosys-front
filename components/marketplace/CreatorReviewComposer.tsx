'use client';

import { useState } from 'react';
import { submitCreatorReview } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { StarRatingInput } from '@/components/marketplace/StarRatingInput';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useAuth } from '@/context/AuthContext';

type CreatorReviewComposerProps = {
  creatorId: string;
  creatorName: string;
  embedded?: boolean;
  onSubmitted?: () => void;
};

export function CreatorReviewComposer({
  creatorId,
  creatorName,
  embedded = false,
  onSubmitted,
}: CreatorReviewComposerProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isSelf = user?.id === creatorId;

  if (authLoading) {
    return <p className="text-sm text-gray-500">Chargement…</p>;
  }

  if (!user) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        Connectez-vous pour laisser un avis sur {creatorName}.
      </p>
    );
  }

  if (isSelf) {
    return null;
  }

  if (submitted) {
    return (
      <p
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        role="status"
      >
        Merci ! Votre avis a été publié.
      </p>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Veuillez sélectionner une note.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await submitCreatorReview(creatorId, { rating, comment: comment.trim() || undefined, wouldRecommend });
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de publier votre avis.'));
    } finally {
      setSubmitting(false);
    }
  };

  const formBody = (
    <>
      {!embedded && <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Laisser un avis</h3>}
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      <div>
        <p className="mb-2 text-sm text-gray-600 dark:text-neutral-400">Votre note</p>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>
      <div>
        <label htmlFor="creator-review-comment" className="mb-2 block text-sm text-gray-600 dark:text-neutral-400">
          Commentaire (optionnel)
        </label>
        <textarea
          id="creator-review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
          placeholder={`Partagez votre expérience avec ${creatorName}…`}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-300">
        <input
          type="checkbox"
          checked={wouldRecommend}
          onChange={(e) => setWouldRecommend(e.target.checked)}
          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
        />
        Je recommande ce créateur
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 sm:w-auto"
      >
        {submitting ? 'Publication…' : 'Publier mon avis'}
      </button>
    </>
  );

  if (embedded) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        {formBody}
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      {formBody}
    </form>
  );
}
