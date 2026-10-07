'use client';

import { useState } from 'react';
import {
  ContentPostDialogShell,
  DIALOG_PRIMARY_BUTTON,
  DIALOG_SECONDARY_BUTTON,
} from '@/components/creator/ContentPostDialogShell';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { getApiErrorMessage } from '@/lib/api-error';
import { mediaImageSrc } from '@/lib/media-image-url';
import { repostContent } from '@/lib/marketplace-api';
import type { PublicContentFeedItem } from '@/types/marketplace';

const NOTE_MAX = 3000;

/**
 * "Repost" — shares someone else's post on the viewer's own profile, optionally with a note above it.
 * `original` is the post the repost points at (never a repost itself).
 */
export function ContentPostRepostDialog({
  open,
  original,
  onClose,
  onReposted,
}: {
  open: boolean;
  original: PublicContentFeedItem;
  onClose: () => void;
  onReposted: (repost: PublicContentFeedItem) => void;
}) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setNote('');
      setError(null);
      setSubmitting(false);
    }
  }

  const creatorName = original.creator.fullName?.trim() || 'Creator';
  const excerpt = (original.title?.trim() || original.description?.trim() || '').slice(0, 180);
  const cover = original.mediaUrls?.[0] ?? original.mediaUrl;
  const extraImages = (original.mediaUrls?.length ?? 0) > 1 ? original.mediaUrls!.length - 1 : 0;

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const repost = await repostContent(original.id, note);
      onReposted(repost);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to repost this.'));
      setSubmitting(false);
    }
  };

  return (
    <ContentPostDialogShell open={open} title="Repost" onClose={onClose} busy={submitting}>
      <div className="px-5 pb-5">
        <label htmlFor="repost-note" className="sr-only">
          Add your thoughts
        </label>
        <textarea
          id="repost-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={NOTE_MAX}
          rows={3}
          autoFocus
          placeholder="Add your thoughts (optional)"
          className="block w-full resize-none rounded-xl border border-black/[0.14] bg-transparent px-3.5 py-3 text-[15px] text-[#111111] caret-[#FF5722] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-neutral-400 focus:border-[#FF5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.16)] dark:border-white/[0.16] dark:text-white dark:placeholder:text-neutral-600"
        />

        <div className="mt-4 flex gap-3 overflow-hidden rounded-xl border border-black/[0.1] p-3 dark:border-white/[0.14]">
          {cover ? (
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaImageSrc(cover, 128)} alt="" className="h-full w-full object-cover" loading="lazy" />
              {extraImages > 0 ? (
                <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[11px] font-semibold text-white">
                  +{extraImages}
                </span>
              ) : null}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <AvatarImage
                src={original.creator.avatarUrl}
                className="h-6 w-6 shrink-0 rounded-full object-cover"
                displayWidth={24}
                fallback={
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    {creatorName.slice(0, 1).toUpperCase()}
                  </span>
                }
              />
              <span className="truncate text-[14px] font-semibold text-[#111111] dark:text-white">{creatorName}</span>
            </div>
            {excerpt ? (
              <p className="mt-1.5 line-clamp-3 text-[14px] leading-snug text-neutral-600 dark:text-neutral-300">{excerpt}</p>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-[14px] font-medium text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} disabled={submitting} className={DIALOG_SECONDARY_BUTTON}>
            Cancel
          </button>
          <button type="button" onClick={() => void submit()} disabled={submitting} className={DIALOG_PRIMARY_BUTTON}>
            {submitting ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            ) : null}
            Repost
          </button>
        </div>
      </div>
    </ContentPostDialogShell>
  );
}
