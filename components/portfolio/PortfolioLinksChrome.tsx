'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faPenToSquare,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { deriveProfileLinkLabel, getHttpUrlFieldError, toAbsoluteHttpUrl } from '@/components/creator/studio/profile-form-schema';
import { uploadContentMedia } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import {
  portfolioFieldErrorTextClass,
  portfolioInlineInputClass,
  portfolioInlineInputErrorClass,
} from '@/components/portfolio/portfolio-section-shared';
import {
  resolveLinkBrandIconMetrics,
  type LinkBrandIconVisualSize,
} from '@/components/portfolio/portfolio-nav-tri-zone-social';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export type PortfolioLinkItem = {
  id: string;
  label: string;
  url: string;
  type: string;
  platform?: string | null;
  iconUrl?: string | null;
};

export type PortfolioLinkDraft = {
  url: string;
  iconUrl?: string | null;
};

/** Visible on touch devices; hover/focus only on fine-pointer desktops. */
const itemActionVisibilityClass =
  'opacity-100 transition-opacity ' +
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100';

function toDraft(link: PortfolioLinkItem): PortfolioLinkDraft {
  return { url: link.url, iconUrl: link.iconUrl ?? null };
}

function normalizeDraft(draft: PortfolioLinkDraft): PortfolioLinkDraft {
  const trimmed = draft.url.trim();
  return { url: toAbsoluteHttpUrl(trimmed) ?? trimmed };
}

function draftsEqual(left: PortfolioLinkDraft, right: PortfolioLinkDraft): boolean {
  return (
    normalizeDraft(left).url === normalizeDraft(right).url &&
    (left.iconUrl?.trim() || null) === (right.iconUrl?.trim() || null)
  );
}

function isLinkEmpty(draft: PortfolioLinkDraft): boolean {
  return !normalizeDraft(draft).url;
}

function isLinkIncomplete(draft: PortfolioLinkDraft): boolean {
  return !normalizeDraft(draft).url;
}

function linkIsFilled(link: PortfolioLinkItem): boolean {
  return link.url.trim().length > 0;
}

function displayHostname(url: string): string {
  return deriveProfileLinkLabel(url);
}

/** Infer brand key from URL hostname (and optional stored platform). */
function inferLinkBrand(
  url: string,
  platform?: string | null
): 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM' | 'LINKEDIN' | 'GITHUB' | 'TWITTER' | 'FACEBOOK' | 'WEBSITE' {
  const stored = platform?.trim().toUpperCase();
  if (
    stored === 'YOUTUBE' ||
    stored === 'TIKTOK' ||
    stored === 'INSTAGRAM' ||
    stored === 'LINKEDIN' ||
    stored === 'GITHUB' ||
    stored === 'TWITTER' ||
    stored === 'FACEBOOK'
  ) {
    return stored;
  }

  let host = '';
  try {
    const withProtocol = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    host = new URL(withProtocol).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    host = url.toLowerCase();
  }

  if (host.includes('youtube') || host === 'youtu.be') return 'YOUTUBE';
  if (host.includes('tiktok')) return 'TIKTOK';
  if (host.includes('instagram')) return 'INSTAGRAM';
  if (host.includes('linkedin')) return 'LINKEDIN';
  if (host.includes('github')) return 'GITHUB';
  if (host.includes('twitter') || host === 'x.com' || host.endsWith('.x.com')) return 'TWITTER';
  if (host.includes('facebook') || host.includes('fb.com') || host.includes('fb.me')) {
    return 'FACEBOOK';
  }
  return 'WEBSITE';
}

function BrowserLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M2.5 12h19M12 2.5c2.5 2.8 3.8 6.1 3.8 9.5S14.5 18.7 12 21.5C9.5 18.7 8.2 15.4 8.2 12S9.5 5.3 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4.2 7.2h15.6M4.2 16.8h15.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkBrandIcon({
  url,
  platform,
  iconUrl,
  size = 'card',
  monochrome = false,
}: {
  url: string;
  platform?: string | null;
  iconUrl?: string | null;
  size?: LinkBrandIconVisualSize;
  monochrome?: boolean;
}) {
  const metrics = resolveLinkBrandIconMetrics(size);
  const shell = metrics.shell;
  const monoClass = monochrome ? 'grayscale text-neutral-800 dark:text-neutral-100' : '';
  const customIcon = iconUrl?.trim();
  if (customIcon) {
    return (
      <span
        className={`inline-flex ${shell} shrink-0 overflow-hidden rounded-full ${monoClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customIcon}
          alt=""
          className={`h-full w-full object-cover ${monochrome ? 'grayscale' : ''}`}
        />
      </span>
    );
  }

  const brand = inferLinkBrand(url, platform);
  const glyph = metrics.glyph;
  const facebookGlyph = metrics.facebook;

  if (brand === 'WEBSITE') {
    return (
      <span
        className={`inline-flex ${shell} shrink-0 items-center justify-center rounded-full ${
          monochrome
            ? 'bg-neutral-200/80 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100'
            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
        }`}
      >
        <BrowserLogo className={glyph} />
      </span>
    );
  }

  if (brand === 'FACEBOOK') {
    return (
      <span
        className={`inline-flex ${shell} shrink-0 items-center justify-center rounded-full ${
          monochrome ? monoClass : 'text-[#1877F2]'
        }`}
      >
        <FacebookLogo className={facebookGlyph} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex ${shell} shrink-0 items-center justify-center rounded-full ${
        monochrome ? `bg-neutral-100 ${monoClass} dark:bg-neutral-800` : socialPlatformBrandClass(brand)
      }`}
    >
      <SocialPlatformIcon platform={brand} className={glyph} />
    </span>
  );
}

export { LinkBrandIcon };

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
  children: React.ReactNode;
  active?: boolean;
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
          : active
            ? 'border-[#F97316]/40 bg-[#FFF7ED] text-[#EA580C] dark:border-[#F97316]/30 dark:bg-[#F97316]/10 dark:text-[#FB923C]'
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

function LinkPreview({
  url,
  platform,
  iconUrl,
}: {
  url: string;
  platform?: string | null;
  iconUrl?: string | null;
}) {
  const trimmed = url.trim();
  const hostname = displayHostname(trimmed);

  if (!trimmed) {
    return (
      <p className="text-sm italic text-neutral-400 dark:text-neutral-500">No URL yet</p>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3.5">
      <LinkBrandIcon url={trimmed} platform={platform} iconUrl={iconUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-neutral-900 dark:text-white sm:text-base">
          {hostname}
        </p>
        <p className="truncate text-sm font-medium text-sky-600 dark:text-sky-400">{trimmed}</p>
      </div>
    </div>
  );
}

export function PortfolioLinksReadOnly({
  links,
  onLinkSave,
  onLinksSave: _onLinksSave,
  onRemoveLink,
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
  links: PortfolioLinkItem[];
  onLinkSave?: (index: number, next: PortfolioLinkDraft) => Promise<void>;
  onLinksSave?: (next: PortfolioLinkDraft[]) => Promise<void>;
  onRemoveLink?: (index: number) => Promise<void> | void;
  fieldSaving?: boolean;
  /** @deprecated Per-item actions; kept for call-site compatibility. */
  actionsVisible?: boolean;
  /** Add-link compose without a section Edit mode. */
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
  const canEdit = Boolean(onLinkSave);
  const canDelete = Boolean(onRemoveLink);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<PortfolioLinkDraft[]>(() => links.map(toDraft));
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const prevItemsLengthRef = useRef(links.length);
  const editingCardRef = useRef<HTMLDivElement | null>(null);
  const cancelEditRef = useRef<() => Promise<void>>(async () => undefined);

  const syncDraftsFromItems = () => {
    setDrafts(links.map(toDraft));
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
  }, [links]);

  useEffect(() => {
    const prevLength = prevItemsLengthRef.current;
    prevItemsLengthRef.current = links.length;
    if (!composeAdd || fieldSaving) return;
    if (links.length > prevLength) {
      const lastIndex = links.length - 1;
      if (isLinkEmpty(toDraft(links[lastIndex]))) {
        setDrafts(links.map(toDraft));
        setEditingIndex(lastIndex);
        setPendingDeleteIndex(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links.length, composeAdd]);

  useEffect(() => {
    if (!composeAdd || fieldSaving) return;
    if (editingIndex != null) return;
    const lastIndex = links.length - 1;
    if (lastIndex < 0) return;
    if (isLinkEmpty(toDraft(links[lastIndex]))) {
      setDrafts(links.map(toDraft));
      setEditingIndex(lastIndex);
      setPendingDeleteIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAdd, links.length]);

  const startEdit = (index: number) => {
    if (!canEdit || fieldSaving) return;
    setPendingDeleteIndex(null);
    setUrlError(null);
    setUploadError(null);
    syncDraftsFromItems();
    setEditingIndex(index);
  };

  const cancelEdit = async () => {
    if (fieldSaving || editingIndex == null) return;
    const original = links[editingIndex];
    const wasEmpty = original ? isLinkEmpty(toDraft(original)) : true;
    setEditingIndex(null);
    setUrlError(null);
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

  const updateDraft = (index: number, patch: Partial<PortfolioLinkDraft>) => {
    if (patch.url !== undefined) setUrlError(null);
    if (patch.iconUrl !== undefined) setUploadError(null);
    setDrafts((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const onIconFileChange = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingIcon(true);
    setUploadError(null);
    try {
      const uploaded = await uploadContentMedia(file);
      const draft = drafts[index];
      if (draft) updateDraft(index, { ...draft, iconUrl: uploaded });
    } catch (e) {
      setUploadError(getApiErrorMessage(e, 'Unable to upload logo.'));
    } finally {
      setUploadingIcon(false);
    }
  };

  const fieldHasChanges =
    editingIndex != null &&
    drafts[editingIndex] != null &&
    links[editingIndex] != null &&
    !draftsEqual(drafts[editingIndex], toDraft(links[editingIndex]));

  const confirmEdit = async () => {
    if (editingIndex == null || !onLinkSave || fieldSaving) return;
    const draft = drafts[editingIndex];
    if (!draft) return;
    if (isLinkIncomplete(draft)) {
      setEditingIndex(null);
      setUrlError(null);
      if (isLinkEmpty(draft)) {
        onCancelNewItem?.();
        return;
      }
      if (onRemoveLink) await onRemoveLink(editingIndex);
      return;
    }
    const invalid = getHttpUrlFieldError(draft.url);
    if (invalid) {
      setUrlError(invalid);
      return;
    }
    setUrlError(null);
    if (!fieldHasChanges) {
      setEditingIndex(null);
      return;
    }
    try {
      await onLinkSave(editingIndex, normalizeDraft(draft));
      setEditingIndex(null);
    } catch {
      // Parent surfaces the error.
    }
  };

  const visibleEntries = links
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item, index }) =>
        index === editingIndex || linkIsFilled(item) || composeAdd
    );

  if (visibleEntries.length === 0 && !composeAdd) {
    return (
      <p className="py-10 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
        No links yet. Click Add link to create one.
      </p>
    );
  }

  const cardClass =
    'group relative rounded-[1.15rem] border border-transparent bg-white p-5 transition-colors duration-200 hover:bg-neutral-50 sm:rounded-[1.35rem] sm:p-6 dark:bg-[#0a0a0a] dark:hover:bg-neutral-900/80';

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {visibleEntries.map(({ item, index }) => {
        const draft = drafts[index] ?? toDraft(item);
        const editing = Boolean(canEdit && editingIndex === index);
        const showConfirmActions = Boolean(editing && onLinkSave);
        const showItemChrome = Boolean((canEdit || canDelete) && !editing);
        const canConfirm = Boolean(draft.url.trim()) && fieldHasChanges;
        const href = item.url.trim();
        const canNavigate =
          Boolean(href) &&
          !editing &&
          !showConfirmActions &&
          !showItemChrome &&
          pendingDeleteIndex !== index;

        const body = (
          <>
            {showConfirmActions ? (
              <div className="absolute right-3 top-3 z-10 inline-flex h-8 items-center gap-1.5">
                <IconButton
                  label={
                    draft.url.trim()
                      ? fieldHasChanges
                        ? 'Confirm link'
                        : 'No changes'
                      : 'Discard incomplete link'
                  }
                  tone={canConfirm ? 'confirm' : 'neutral'}
                  disabled={fieldSaving}
                  onClick={() => void confirmEdit()}
                >
                  {fieldSaving && editingIndex === index ? (
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
            ) : showItemChrome ? (
              <div
                className={`absolute right-3 top-3 z-10 inline-flex h-8 items-center gap-1.5 ${
                  pendingDeleteIndex === index ? 'opacity-100' : itemActionVisibilityClass
                }`}
              >
                {pendingDeleteIndex === index ? (
                  <>
                    <span className="hidden text-[11px] font-medium text-red-600 sm:inline dark:text-red-400">
                      Delete?
                    </span>
                    <IconButton
                      label="Confirm delete link"
                      tone="confirm"
                      disabled={fieldSaving}
                      onClick={() => {
                        void (async () => {
                          if (!onRemoveLink) return;
                          await onRemoveLink(index);
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
                        label="Edit link"
                        disabled={fieldSaving}
                        onClick={() => startEdit(index)}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                      </IconButton>
                    ) : null}
                    {canDelete ? (
                      <IconButton
                        label="Delete link"
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

            <div className="flex items-start gap-3">
              <div className={`min-w-0 flex-1 space-y-3 ${showItemChrome ? 'pr-12' : ''}`}>
                {editing ? (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      URL
                    </label>
                    <input
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      value={draft.url}
                      onChange={(event) => updateDraft(index, { url: event.target.value })}
                      placeholder="https://"
                      aria-invalid={urlError ? true : undefined}
                      className={`${urlError ? portfolioInlineInputErrorClass : portfolioInlineInputClass} min-w-0 flex-1 font-medium`}
                      autoFocus={editingIndex === index}
                      disabled={fieldSaving}
                    />
                    {urlError ? <p className={portfolioFieldErrorTextClass}>{urlError}</p> : null}
                    {draft.url.trim() ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-3">
                          <input
                            ref={editingIndex === index ? iconInputRef : undefined}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            className="sr-only"
                            onChange={(event) => void onIconFileChange(index, event)}
                          />
                          <button
                            type="button"
                            disabled={fieldSaving || uploadingIcon}
                            onClick={() => iconInputRef.current?.click()}
                            title="Upload custom icon"
                            aria-label="Upload custom icon"
                            className="relative inline-flex shrink-0 items-center justify-center transition hover:opacity-90 disabled:opacity-50"
                          >
                            {uploadingIcon && editingIndex === index ? (
                              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                <LoadingSpinner size="sm" />
                              </span>
                            ) : (
                              <LinkBrandIcon
                                url={draft.url}
                                platform={item.platform}
                                iconUrl={draft.iconUrl}
                              />
                            )}
                          </button>
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Shown as {displayHostname(draft.url)}
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              {draft.iconUrl
                                ? 'Custom icon · click to replace'
                                : 'Auto-detected · click icon to upload yours'}
                            </p>
                          </div>
                        </div>
                        {draft.iconUrl ? (
                          <button
                            type="button"
                            disabled={fieldSaving || uploadingIcon}
                            onClick={() => updateDraft(index, { ...draft, iconUrl: null })}
                            className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
                          >
                            Use auto-detected icon
                          </button>
                        ) : null}
                        {uploadError && editingIndex === index ? (
                          <p className={portfolioFieldErrorTextClass}>{uploadError}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <LinkPreview
                    url={item.url}
                    platform={item.platform}
                    iconUrl={item.iconUrl}
                  />
                )}
              </div>
            </div>
          </>
        );

        if (canNavigate) {
          return (
            <a
              key={item.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cardClass} block no-underline`}
              aria-label={`Open ${displayHostname(href)}`}
            >
              {body}
            </a>
          );
        }

        return (
          <div key={item.id} ref={editing ? editingCardRef : undefined} className={cardClass}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
