'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faPenToSquare,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { ContentMediaPreview } from '@/components/creator/creator-content-media';
import { getHttpUrlFieldError, inferProfileMediaType, toAbsoluteHttpUrl } from '@/components/creator/studio/profile-form-schema';
import { portfolioFieldErrorTextClass } from '@/components/portfolio/portfolio-section-shared';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_EMPTY_CLASS,
  STUDIO_ICON_BUTTON_TONES,
  STUDIO_LABEL_CLASS,
  STUDIO_SECONDARY_CLASS,
  STUDIO_VALUE_CLASS,
  StudioUnderline,
} from '@/components/portfolio/PortfolioStudioKit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { uploadContentMedia } from '@/lib/marketplace-api';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';
import { MAX_GALLERY } from '@/components/creator/studio/ProfileGalleryField';

export type PortfolioGalleryItem = {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | null;
};

export type PortfolioGalleryItemDraft = {
  title: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | null;
};

const GALLERY_MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';

const GALLERY_MEDIA_ASPECT_CLASS = 'aspect-[4/3]';

/** Visible on touch devices; hover/focus only on fine-pointer desktops. */
const itemActionVisibilityClass =
  'opacity-100 transition-opacity ' +
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/item:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within/item:opacity-100';

function itemIsFilled(item: PortfolioGalleryItem): boolean {
  return item.mediaUrl.trim().length > 0;
}

function toDraft(item: PortfolioGalleryItem): PortfolioGalleryItemDraft {
  return {
    title: item.title,
    mediaUrl: item.mediaUrl,
    mediaType: item.mediaType,
  };
}

function normalizeDraft(draft: PortfolioGalleryItemDraft): PortfolioGalleryItemDraft {
  const raw = draft.mediaUrl.trim();
  const mediaUrl = toAbsoluteHttpUrl(raw) ?? raw;
  return {
    title: draft.title.trim(),
    mediaUrl,
    mediaType: mediaUrl ? draft.mediaType ?? inferProfileMediaType(mediaUrl) : null,
  };
}

function draftsEqual(left: PortfolioGalleryItemDraft, right: PortfolioGalleryItemDraft): boolean {
  const a = normalizeDraft(left);
  const b = normalizeDraft(right);
  return a.title === b.title && a.mediaUrl === b.mediaUrl && a.mediaType === b.mediaType;
}

function isGalleryEmpty(draft: PortfolioGalleryItemDraft): boolean {
  return !normalizeDraft(draft).mediaUrl;
}

function isGalleryIncomplete(draft: PortfolioGalleryItemDraft): boolean {
  return !normalizeDraft(draft).mediaUrl;
}

function formatMediaType(type: PortfolioGalleryItem['mediaType']): string | null {
  if (type === 'VIDEO') return 'Video';
  if (type === 'IMAGE') return 'Image';
  return null;
}

function IconButton({
  label,
  onClick,
  children,
  active = false,
  disabled = false,
  tone = 'neutral',
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  tone?: 'neutral' | 'confirm' | 'cancel' | 'danger';
}) {
  const toneClass = STUDIO_ICON_BUTTON_TONES[active && tone === 'neutral' ? 'active' : tone];

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function GalleryMediaEditor({
  draft,
  onChange,
  disabled,
  mediaUrlError,
}: {
  draft: PortfolioGalleryItemDraft;
  onChange: (next: PortfolioGalleryItemDraft) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  mediaUrlError?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const hasMedia = Boolean(draft.mediaUrl.trim());

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadContentMedia(file);
      onChange({
        ...draft,
        mediaUrl: url,
        mediaType: inferProfileMediaType(url),
      });
    } catch (error) {
      setUploadError(getApiErrorMessage(error, 'Upload failed.'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={GALLERY_MEDIA_ACCEPT}
        className="hidden"
        onChange={(event) => void onFileChange(event)}
      />
      <div className={`relative overflow-hidden rounded-lg bg-black/[0.03] dark:bg-white/[0.04] ${GALLERY_MEDIA_ASPECT_CLASS}`}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="group relative block h-full w-full overflow-hidden disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={hasMedia ? 'Replace media from device' : 'Add media from device'}
        >
          {hasMedia ? (
            <ContentMediaPreview
              locale="en"
              mediaUrl={draft.mediaUrl.trim()}
              mediaType="FILE"
              large
              fluid
              compact
            />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-3 px-4">
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors duration-200 group-hover:border-[#FF5722] group-hover:text-[#FF5722] dark:border-white/25 dark:bg-transparent dark:text-white/80"
                  aria-hidden
                >
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4" fixedWidth />
                </span>
              )}
              <span className={STUDIO_SECONDARY_CLASS}>
                {uploading ? 'Uploading…' : 'Add from device'}
              </span>
            </span>
          )}
          {hasMedia ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[14px] font-medium text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
              {uploading ? 'Uploading…' : 'Replace from device'}
            </span>
          ) : null}
        </button>
      </div>
      <div className="grid gap-y-8 pt-6">
        <StudioUnderline>
          <label className={STUDIO_LABEL_CLASS}>
            Title
            <input
              type="text"
              autoComplete="off"
              value={draft.title}
              onChange={(event) =>
                onChange({
                  ...draft,
                  title: event.target.value,
                })
              }
              placeholder="Add a title"
              className={`mt-3 ${STUDIO_BARE_INPUT_CLASS} ${STUDIO_VALUE_CLASS}`}
              disabled={disabled || uploading}
            />
          </label>
        </StudioUnderline>
        <div>
          <StudioUnderline>
            <label className={STUDIO_LABEL_CLASS}>
              Or paste media URL
              <input
                type="text"
                inputMode="url"
                autoComplete="url"
                value={draft.mediaUrl}
                onChange={(event) => {
                  const mediaUrl = event.target.value;
                  onChange({
                    ...draft,
                    mediaUrl,
                    mediaType: mediaUrl.trim() ? inferProfileMediaType(mediaUrl.trim()) : null,
                  });
                }}
                placeholder="https://"
                aria-invalid={mediaUrlError ? true : undefined}
                className={`mt-3 ${STUDIO_BARE_INPUT_CLASS} ${STUDIO_VALUE_CLASS} ${
                  mediaUrlError ? '!text-red-600 dark:!text-red-400' : ''
                }`}
                disabled={disabled || uploading}
              />
            </label>
          </StudioUnderline>
          {mediaUrlError ? <p className={portfolioFieldErrorTextClass}>{mediaUrlError}</p> : null}
          {hasMedia ? (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => onChange({ ...draft, mediaUrl: '', mediaType: null })}
              className="mt-3 text-[13px] font-medium text-neutral-500 transition-colors hover:text-[#FF5722] disabled:opacity-40 dark:text-neutral-400"
            >
              Clear media
            </button>
          ) : null}
          {uploadError ? <p className="mt-2 text-[13px] text-red-600 dark:text-red-400">{uploadError}</p> : null}
        </div>
      </div>
    </div>
  );
}

function GalleryMediaDisplay({
  title,
  mediaUrl,
  mediaType,
}: {
  title: string;
  mediaUrl: string;
  mediaType: PortfolioGalleryItem['mediaType'];
}) {
  const mediaTypeLabel = formatMediaType(mediaType);

  return (
    <div>
      <div className={`relative w-full overflow-hidden rounded-lg bg-black/[0.03] dark:bg-white/[0.04] ${GALLERY_MEDIA_ASPECT_CLASS}`}>
        {mediaUrl.trim() ? (
          <ContentMediaPreview
            locale="en"
            mediaUrl={mediaUrl.trim()}
            mediaType="FILE"
            large
            fluid
            compact
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${STUDIO_EMPTY_CLASS}`}>No media</div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-4 pt-3">
        <p className={`min-w-0 truncate ${title.trim() ? STUDIO_VALUE_CLASS : STUDIO_EMPTY_CLASS}`}>
          {title.trim() || 'Untitled'}
        </p>
        {mediaTypeLabel ? <span className={`shrink-0 ${STUDIO_SECONDARY_CLASS}`}>{mediaTypeLabel}</span> : null}
      </div>
    </div>
  );
}

export function PortfolioGalleryReadOnly({
  items,
  onItemSave,
  onItemsSave: _onItemsSave,
  onRemoveItem,
  fieldSaving = false,
  actionsVisible: _actionsVisible = false,
  composeAdd = false,
  deleteMode: _deleteMode = false,
  onDeleteModeChange: _onDeleteModeChange,
  onCancelNewItem,
  sectionRootRef: _sectionRootRef,
  onGlobalHasChangesChange,
  onRegisterGlobalConfirm,
}: {
  items: PortfolioGalleryItem[];
  onItemSave?: (index: number, next: PortfolioGalleryItemDraft) => Promise<void>;
  onItemsSave?: (next: PortfolioGalleryItemDraft[]) => Promise<void>;
  onRemoveItem?: (index: number) => Promise<void> | void;
  fieldSaving?: boolean;
  /** @deprecated Per-item actions; kept for call-site compatibility. */
  actionsVisible?: boolean;
  /** Add-media compose without a section Edit mode. */
  composeAdd?: boolean;
  /** @deprecated Delete is per-item; kept for call-site compatibility. */
  deleteMode?: boolean;
  onDeleteModeChange?: (active: boolean) => void;
  onCancelNewItem?: () => void;
  sectionRootRef?: RefObject<HTMLElement | null>;
  onGlobalHasChangesChange?: (hasChanges: boolean) => void;
  onRegisterGlobalConfirm?: (confirm: (() => Promise<void>) | null) => void;
}) {
  void _sectionRootRef;
  const canEdit = Boolean(onItemSave);
  const canDelete = Boolean(onRemoveItem);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<PortfolioGalleryItemDraft[]>(() => items.map(toDraft));
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [mediaUrlError, setMediaUrlError] = useState<string | null>(null);
  const prevItemsLengthRef = useRef(items.length);
  const editingCardRef = useRef<HTMLElement | null>(null);
  const cancelEditRef = useRef<() => Promise<void>>(async () => undefined);

  const syncDraftsFromItems = () => {
    setDrafts(items.map(toDraft));
  };

  const composing = editingIndex != null;

  useEffect(() => {
    onGlobalHasChangesChange?.(false);
  }, [onGlobalHasChangesChange]);

  useEffect(() => {
    onRegisterGlobalConfirm?.(null);
    return () => onRegisterGlobalConfirm?.(null);
  }, [onRegisterGlobalConfirm]);

  useEffect(() => {
    if (!composeAdd) {
      setPendingDeleteIndex(null);
      if (editingIndex == null) syncDraftsFromItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAdd]);

  useEffect(() => {
    if (editingIndex != null || composeAdd) return;
    syncDraftsFromItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const prevLength = prevItemsLengthRef.current;
    prevItemsLengthRef.current = items.length;
    if (!composeAdd || fieldSaving) return;
    if (items.length > prevLength) {
      const lastIndex = items.length - 1;
      if (isGalleryEmpty(toDraft(items[lastIndex]))) {
        setDrafts(items.map(toDraft));
        setEditingIndex(lastIndex);
        setPendingDeleteIndex(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, composeAdd]);

  useEffect(() => {
    if (!composeAdd || fieldSaving) return;
    if (editingIndex != null) return;
    const lastIndex = items.length - 1;
    if (lastIndex < 0) return;
    if (isGalleryEmpty(toDraft(items[lastIndex]))) {
      setDrafts(items.map(toDraft));
      setEditingIndex(lastIndex);
      setPendingDeleteIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAdd, items.length]);

  const startEdit = (index: number) => {
    if (!canEdit || fieldSaving) return;
    setPendingDeleteIndex(null);
    setMediaUrlError(null);
    syncDraftsFromItems();
    setEditingIndex(index);
  };

  const cancelEdit = async () => {
    if (fieldSaving || editingIndex == null) return;
    const original = items[editingIndex];
    const wasEmpty = original ? isGalleryEmpty(toDraft(original)) : true;
    setEditingIndex(null);
    setMediaUrlError(null);
    syncDraftsFromItems();
    if (wasEmpty) {
      onCancelNewItem?.();
    }
  };
  cancelEditRef.current = cancelEdit;

  useEffect(() => {
    if (!composing) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (editingCardRef.current?.contains(target)) return;
      void cancelEditRef.current();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [composing]);

  const updateDraft = (index: number, next: PortfolioGalleryItemDraft) => {
    setMediaUrlError(null);
    setDrafts((prev) => prev.map((item, itemIndex) => (itemIndex === index ? next : item)));
  };

  const fieldHasChanges =
    editingIndex != null &&
    drafts[editingIndex] != null &&
    items[editingIndex] != null &&
    !draftsEqual(drafts[editingIndex], toDraft(items[editingIndex]));

  const confirmEdit = async () => {
    if (editingIndex == null || !onItemSave || fieldSaving) return;
    const draft = drafts[editingIndex];
    if (!draft) return;
    if (isGalleryIncomplete(draft)) {
      setEditingIndex(null);
      setMediaUrlError(null);
      if (isGalleryEmpty(draft)) {
        onCancelNewItem?.();
        return;
      }
      if (onRemoveItem) await onRemoveItem(editingIndex);
      return;
    }
    const invalidMedia = getHttpUrlFieldError(draft.mediaUrl);
    if (invalidMedia) {
      setMediaUrlError(invalidMedia);
      return;
    }
    setMediaUrlError(null);
    const normalized = normalizeDraft(draft);
    const originalEmpty = isGalleryEmpty(toDraft(items[editingIndex]));
    if (!fieldHasChanges && !originalEmpty) {
      setEditingIndex(null);
      return;
    }
    try {
      await onItemSave(editingIndex, normalized);
      setEditingIndex(null);
    } catch {
      // Parent surfaces the error.
    }
  };

  const visibleEntries = items
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item, index }) =>
        index === editingIndex || itemIsFilled(item) || composeAdd
    );

  const shellClass = '-mx-5 -mb-1 -mt-5 px-5 py-5 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-6';

  if (visibleEntries.length === 0 && !composeAdd) {
    return (
      <div className={`${shellClass} py-5`}>
        <ProfileSectionItemCount
          count={items.filter((item) => (item.mediaUrl ?? '').trim().length > 0).length}
          limit={MAX_GALLERY}
          unit="gallery items"
          className="mb-6"
        />
        <p className={STUDIO_EMPTY_CLASS}>No gallery media yet. Click Add media to create one.</p>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <ProfileSectionItemCount
        count={items.filter((item) => (item.mediaUrl ?? '').trim().length > 0).length}
        limit={MAX_GALLERY}
        unit="gallery items"
        className="mb-4"
      />
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {visibleEntries.map(({ item, index }) => {
          const draft = drafts[index] ?? toDraft(item);
          const editing = Boolean(canEdit && editingIndex === index);
          const showConfirmActions = Boolean(editing && onItemSave);
          const showCardChrome = Boolean((canEdit || canDelete) && !editing);
          const canConfirm =
            Boolean(draft.mediaUrl.trim()) &&
            (fieldHasChanges || isGalleryEmpty(toDraft(item)));
          const confirming = fieldSaving && editingIndex === index;

          return (
            <article
              key={item.id}
              ref={editing ? editingCardRef : undefined}
              className="group/item relative flex h-full flex-col"
            >
              {showConfirmActions ? (
                <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5">
                  <IconButton
                    label={
                      draft.mediaUrl.trim()
                        ? fieldHasChanges
                          ? 'Confirm media'
                          : 'No changes'
                        : 'Discard incomplete media'
                    }
                    tone={canConfirm ? 'confirm' : 'neutral'}
                    disabled={fieldSaving}
                    onClick={() => void confirmEdit()}
                  >
                    {confirming ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                    )}
                  </IconButton>
                  <IconButton
                    label="Cancel"
                    tone="cancel"
                    disabled={fieldSaving}
                    onClick={() => void cancelEdit()}
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                  </IconButton>
                </div>
              ) : showCardChrome ? (
                <div
                  className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 ${
                    pendingDeleteIndex === index ? 'opacity-100' : itemActionVisibilityClass
                  }`}
                >
                  {pendingDeleteIndex === index ? (
                    <>
                      <IconButton
                        label="Confirm delete media"
                        tone="confirm"
                        disabled={fieldSaving}
                        onClick={() => {
                          void (async () => {
                            if (!onRemoveItem) return;
                            await onRemoveItem(index);
                            setPendingDeleteIndex(null);
                            setEditingIndex(null);
                          })();
                        }}
                      >
                        {fieldSaving && pendingDeleteIndex === index ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                        )}
                      </IconButton>
                      <IconButton
                        label="Cancel"
                        tone="cancel"
                        disabled={fieldSaving}
                        onClick={() => setPendingDeleteIndex(null)}
                      >
                        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      {canEdit ? (
                        <IconButton
                          label="Edit media"
                          disabled={fieldSaving}
                          onClick={() => startEdit(index)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                        </IconButton>
                      ) : null}
                      {canDelete ? (
                        <IconButton
                          label="Delete media"
                          tone="danger"
                          disabled={fieldSaving}
                          onClick={() => {
                            setEditingIndex(null);
                            setPendingDeleteIndex(index);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" fixedWidth />
                        </IconButton>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}

              <div className="flex flex-1 flex-col">
                {editing ? (
                  <GalleryMediaEditor
                    draft={draft}
                    onChange={(next) => updateDraft(index, next)}
                    disabled={fieldSaving}
                    mediaUrlError={mediaUrlError}
                  />
                ) : (
                  <GalleryMediaDisplay
                    title={item.title}
                    mediaUrl={item.mediaUrl}
                    mediaType={item.mediaType}
                  />
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
