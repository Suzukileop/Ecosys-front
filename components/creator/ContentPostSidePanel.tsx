'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  ContentPostDetailsBlock,
  type ContentDetailsDraft,
  type ContentPostDetailsPost,
} from '@/components/creator/ContentPostDetailsBlock';
import { ContentPostCommentsButton } from '@/components/creator/ContentPostSocialBar';
import { CommentThread } from '@/components/marketplace/CommentThread';
import type { ContentPostBucket } from '@/types/creator-content';

const FADE_MS = 280;

type ContentPostSidePanelProps = {
  post: ContentPostDetailsPost & { id: string };
  bucket?: ContentPostBucket;
  commentCount?: number;
  commentsEnabled?: boolean;
  moderationMode?: boolean;
  onCommentsToggle: (open: boolean) => void;
  onCountChange: (count: number) => void;
  loginRedirect?: string;
  isAuthenticated?: boolean;
  className?: string;
  editing?: boolean;
  editDraft?: ContentDetailsDraft | null;
  onEditDraftChange?: (draft: ContentDetailsDraft) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  editSaving?: boolean;
};

export function ContentPostSidePanel({
  post,
  bucket = 'active',
  commentCount,
  commentsEnabled = true,
  moderationMode = false,
  onCommentsToggle,
  onCountChange,
  loginRedirect = '/login',
  isAuthenticated = true,
  className = '',
  editing = false,
  editDraft = null,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
  editSaving = false,
}: ContentPostSidePanelProps) {
  type PanelFace = 'details' | 'comments';

  const [renderedFace, setRenderedFace] = useState<PanelFace>('details');
  const [panelOpacity, setPanelOpacity] = useState(1);
  const renderedFaceRef = useRef<PanelFace>('details');
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  renderedFaceRef.current = renderedFace;

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setRenderedFace('details');
    renderedFaceRef.current = 'details';
    setPanelOpacity(1);
  }, [post.id]);

  useEffect(() => {
    if (editing && renderedFaceRef.current === 'comments') {
      setRenderedFace('details');
      renderedFaceRef.current = 'details';
      onCommentsToggle(false);
      setPanelOpacity(1);
    }
  }, [editing, onCommentsToggle]);

  const transitionTo = useCallback(
    (open: boolean) => {
      if (bucket === 'trash' || editing) return;

      const nextFace: PanelFace = open ? 'comments' : 'details';
      if (nextFace === renderedFaceRef.current) {
        onCommentsToggle(open);
        return;
      }

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setPanelOpacity(0);

      fadeTimerRef.current = setTimeout(() => {
        setRenderedFace(nextFace);
        onCommentsToggle(open);
        requestAnimationFrame(() => setPanelOpacity(1));
      }, FADE_MS);
    },
    [bucket, editing, onCommentsToggle]
  );

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      <div
        className="flex h-full min-h-0 flex-1 flex-col transition-opacity duration-300 ease-in-out motion-reduce:transition-none"
        style={{ opacity: panelOpacity }}
      >
        {renderedFace === 'details' ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <ContentPostDetailsBlock
                post={post}
                bucket={bucket}
                variant="sidebar"
                editing={editing}
                draft={editDraft ?? undefined}
                onDraftChange={onEditDraftChange}
                disabled={editSaving}
              />
            </div>
            {editing ? (
              <div className="mt-auto flex shrink-0 items-center justify-end gap-2 bg-neutral-100 p-4 dark:bg-neutral-950/50">
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={onCancelEdit}
                  title="Cancel"
                  aria-label="Cancel"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                </button>
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={onSaveEdit}
                  title="Save"
                  aria-label="Save"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  <FontAwesomeIcon
                    icon={editSaving ? faSpinner : faCircleCheck}
                    className={`h-4 w-4 ${editSaving ? 'animate-spin' : ''}`}
                    fixedWidth
                  />
                </button>
              </div>
            ) : (
              <>
                {bucket !== 'trash' && commentsEnabled && (
                  <div className="mt-auto shrink-0 p-5 pt-2">
                    <ContentPostCommentsButton
                      commentCount={commentCount}
                      commentsOpen={false}
                      onToggle={() => transitionTo(true)}
                    />
                  </div>
                )}
                {bucket !== 'trash' && !commentsEnabled && (
                  <div className="mt-auto shrink-0 p-5 text-center text-sm text-neutral-500">
                    Comments are disabled for this content.
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <CommentThread
            variant="panel"
            targetType="POST"
            targetId={post.id}
            isAuthenticated={isAuthenticated}
            loginRedirect={loginRedirect}
            commentsEnabled={commentsEnabled}
            moderationMode={moderationMode}
            onClose={() => transitionTo(false)}
            onCountChange={onCountChange}
            className="flex h-full min-h-0 flex-1 flex-col rounded-none border-0 bg-transparent shadow-none"
          />
        )}
      </div>
    </div>
  );
}
