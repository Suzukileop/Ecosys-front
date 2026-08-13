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
import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SocialPlatformIcon } from '@/components/marketplace/creator-profile-social-icons';
import {
  portfolioFieldErrorTextClass,
  portfolioInlineInputClass,
  portfolioInlineInputErrorClass,
} from '@/components/portfolio/portfolio-section-shared';
import {
  getTeamSocialUrlFieldError,
  inferTeamSocialPlatform,
  toAbsoluteHttpUrl,
  type TeamSocialLinkForm,
} from '@/components/creator/studio/profile-form-schema';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';
import { MAX_TEAM } from '@/components/creator/studio/ProfileTeamField';

export type PortfolioTeamSocialLink = {
  id: string;
  platform: TeamSocialLinkForm['platform'] | string;
  label: string;
  url: string;
  sortOrder: number;
};

export type PortfolioTeamMember = {
  id: string;
  name: string;
  responsibility: string;
  imageUrl: string;
  socialLinks: PortfolioTeamSocialLink[];
};

export type PortfolioTeamDraft = {
  name: string;
  responsibility: string;
  imageUrl: string;
  socialLinks: PortfolioTeamSocialLink[];
};

const MAX_SOCIAL_LINKS = 6;
const TEAM_MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

/** Visible on touch devices; hover/focus only on fine-pointer desktops. */
const itemActionVisibilityClass =
  'opacity-100 transition-opacity ' +
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100';

const TEAM_PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  INSTAGRAM: 'Instagram',
  X: 'X',
  TWITTER: 'Twitter',
  FACEBOOK: 'Facebook',
  YOUTUBE: 'YouTube',
  GITHUB: 'GitHub',
  WEBSITE: 'Website',
  EMAIL: 'Email',
  OTHER: 'Other',
};

function platformLabel(platform: string): string {
  return TEAM_PLATFORM_LABELS[platform] ?? platform;
}

function toDraft(item: PortfolioTeamMember): PortfolioTeamDraft {
  return {
    name: item.name,
    responsibility: item.responsibility,
    imageUrl: item.imageUrl ?? '',
    socialLinks: (item.socialLinks ?? []).map((link, index) => ({
      id: link.id,
      platform: link.platform,
      label: link.label ?? '',
      url: link.url ?? '',
      sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : index,
    })),
  };
}

function normalizeDraft(draft: PortfolioTeamDraft): PortfolioTeamDraft {
  return {
    name: draft.name.trim(),
    responsibility: draft.responsibility.trim(),
    imageUrl: draft.imageUrl.trim(),
    socialLinks: draft.socialLinks
      .filter((link) => link.url.trim().length > 0)
      .map((link, index) => {
        const raw = link.url.trim();
        const platform = inferTeamSocialPlatform(raw);
        const url =
          platform === 'EMAIL' || raw.includes('@') ? raw : (toAbsoluteHttpUrl(raw) ?? raw);
        return {
          id: link.id,
          platform,
          label: link.label?.trim() ?? '',
          url,
          sortOrder: index,
        };
      }),
  };
}

function draftsEqual(left: PortfolioTeamDraft, right: PortfolioTeamDraft): boolean {
  const a = normalizeDraft(left);
  const b = normalizeDraft(right);
  if (
    a.name !== b.name ||
    a.responsibility !== b.responsibility ||
    a.imageUrl !== b.imageUrl ||
    a.socialLinks.length !== b.socialLinks.length
  ) {
    return false;
  }
  return a.socialLinks.every((link, index) => {
    const other = b.socialLinks[index];
    return (
      other != null &&
      link.platform === other.platform &&
      link.label === other.label &&
      link.url === other.url
    );
  });
}

function isTeamEmpty(draft: PortfolioTeamDraft): boolean {
  const normalized = normalizeDraft(draft);
  return (
    !normalized.name &&
    !normalized.responsibility &&
    !normalized.imageUrl &&
    normalized.socialLinks.length === 0
  );
}

function isTeamIncomplete(draft: PortfolioTeamDraft): boolean {
  const normalized = normalizeDraft(draft);
  return !normalized.name || !normalized.responsibility;
}

function createEmptySocialLink(sortOrder: number): PortfolioTeamSocialLink {
  return {
    id: crypto.randomUUID(),
    platform: 'WEBSITE',
    label: '',
    url: '',
    sortOrder,
  };
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

function TeamSocialGlyph({ platform, className }: { platform: string; className?: string }) {
  const glyph = className ?? 'h-3.5 w-3.5';
  if (platform === 'EMAIL') {
    return (
      <svg className={glyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path d="M3.5 6.5h17v11h-17z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }
  if (platform === 'FACEBOOK') {
    return (
      <svg className={glyph} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.2v2H7.5v3h2.8v8h3.4Z" />
      </svg>
    );
  }
  if (platform === 'WEBSITE') {
    return (
      <svg className={glyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" />
      </svg>
    );
  }
  return <SocialPlatformIcon platform={platform} className={glyph} />;
}

function TeamSocialIconRow({
  links,
  name,
}: {
  links: PortfolioTeamSocialLink[];
  name: string;
}) {
  const visible = links.filter((link) => link.url.trim().length > 0);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5 pt-4" aria-label={`Social links for ${name || 'member'}`}>
      {visible.map((link) => {
        const href =
          String(link.platform) === 'EMAIL' && !/^mailto:/i.test(link.url)
            ? `mailto:${link.url.trim()}`
            : link.url.trim();
        return (
          <a
            key={link.id}
            href={href}
            target={String(link.platform) === 'EMAIL' ? undefined : '_blank'}
            rel={String(link.platform) === 'EMAIL' ? undefined : 'noopener noreferrer'}
            aria-label={`${platformLabel(String(link.platform))} — ${name || 'member'}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300 text-white transition hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500"
          >
            <TeamSocialGlyph platform={String(link.platform)} className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}

const TEAM_PHOTO_ASPECT_CLASS = 'aspect-[4/3]';

function TeamPhotoEditor({
  imageUrl,
  onChange,
  disabled,
}: {
  imageUrl: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const { inputRef, uploading, uploadError, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: onChange,
  });
  const hasPhoto = Boolean(imageUrl.trim());

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={TEAM_MEDIA_ACCEPT}
        className="hidden"
        onChange={onFileChange}
      />
      <div className="relative overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <button
          type="button"
          onClick={pickFile}
          disabled={disabled || uploading}
          className={`group relative block w-full overflow-hidden disabled:cursor-not-allowed disabled:opacity-60 ${TEAM_PHOTO_ASPECT_CLASS}`}
          aria-label={hasPhoto ? 'Replace photo' : 'Add photo'}
        >
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-3 px-4">
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 bg-white text-[#EA580C] shadow-sm transition group-hover:border-[#EA580C]/50 group-hover:bg-[#FFF7ED] dark:border-neutral-600 dark:bg-neutral-900 dark:text-[#FB923C] dark:group-hover:border-[#FB923C]/50 dark:group-hover:bg-[#F97316]/10"
                  aria-hidden
                >
                  <FontAwesomeIcon icon={faPlus} className="h-6 w-6" fixedWidth />
                </span>
              )}
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                {uploading ? 'Uploading…' : 'Add photo'}
              </span>
            </span>
          )}
          {hasPhoto ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-semibold text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
              {uploading ? 'Uploading…' : 'Replace photo'}
            </span>
          ) : null}
        </button>
      </div>
      {hasPhoto ? (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => onChange('')}
          className="px-5 pt-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-white"
        >
          Remove photo
        </button>
      ) : null}
      {uploadError ? <p className="px-5 pt-2 text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}

function TeamSocialLinksEditor({
  links,
  onChange,
  disabled,
  urlErrors = {},
}: {
  links: PortfolioTeamSocialLink[];
  onChange: (next: PortfolioTeamSocialLink[]) => void;
  disabled?: boolean;
  urlErrors?: Record<string, string>;
}) {
  return (
    <div className="space-y-3">
      {links.map((link, linkIndex) => {
        const detectedPlatform = inferTeamSocialPlatform(link.url);
        const urlError = urlErrors[link.id];
        return (
          <div key={link.id} className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                title={platformLabel(detectedPlatform)}
                aria-label={platformLabel(detectedPlatform)}
              >
                <TeamSocialGlyph platform={detectedPlatform} className="h-5 w-5" />
              </span>
              <input
                type="text"
                inputMode="url"
                autoComplete="url"
                value={link.url}
                aria-invalid={urlError ? true : undefined}
                onChange={(event) => {
                  const url = event.target.value;
                  onChange(
                    links.map((item, index) =>
                      index === linkIndex
                        ? { ...item, url, platform: inferTeamSocialPlatform(url) }
                        : item
                    )
                  );
                }}
                placeholder="https://… or email"
                className={`${urlError ? portfolioInlineInputErrorClass : portfolioInlineInputClass} min-w-0 flex-1 font-medium`}
                disabled={disabled}
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(links.filter((_, index) => index !== linkIndex))}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-neutral-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                aria-label="Remove social link"
                title="Remove"
              >
                <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
              </button>
            </div>
            {urlError ? <p className={`${portfolioFieldErrorTextClass} pl-12`}>{urlError}</p> : null}
          </div>
        );
      })}
      <button
        type="button"
        disabled={disabled || links.length >= MAX_SOCIAL_LINKS}
        onClick={() => onChange([...links, createEmptySocialLink(links.length)])}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:border-[#EA580C]/50 hover:bg-[#FFF7ED] hover:text-[#EA580C] disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-900/40 dark:text-neutral-300 dark:hover:border-[#FB923C]/50 dark:hover:bg-[#F97316]/10 dark:hover:text-[#FB923C]"
      >
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#EA580C] dark:border-neutral-700 dark:bg-neutral-900 dark:text-[#FB923C]"
          aria-hidden
        >
          <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" fixedWidth />
        </span>
        Add social link
      </button>
    </div>
  );
}

function TeamPhotoDisplay({ name, imageUrl }: { name: string; imageUrl: string }) {
  return (
    <div className={`w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 ${TEAM_PHOTO_ASPECT_CLASS}`}>
      {imageUrl.trim() ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name.trim() || 'Team member'}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-neutral-400 dark:text-neutral-500">
          {name.trim().charAt(0).toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}

export function PortfolioTeamReadOnly({
  items,
  onItemSave,
  onItemsSave: _onItemsSave,
  onRemoveItem,
  fieldSaving = false,
  actionsVisible: _actionsVisible = false,
  composeAdd = false,
  deleteMode: _deleteMode = false,
  onDeleteModeChange: _onDeleteModeChange,
  onComposingChange,
  onCancelNewItem,
  sectionRootRef: _sectionRootRef,
  onGlobalHasChangesChange,
  onRegisterGlobalConfirm,
}: {
  items: PortfolioTeamMember[];
  onItemSave?: (index: number, next: PortfolioTeamDraft) => Promise<void>;
  onItemsSave?: (next: PortfolioTeamDraft[]) => Promise<void>;
  onRemoveItem?: (index: number) => Promise<void> | void;
  fieldSaving?: boolean;
  /** @deprecated Per-item actions; kept for call-site compatibility. */
  actionsVisible?: boolean;
  /** Add-member compose without a section Edit mode. */
  composeAdd?: boolean;
  /** @deprecated Delete is per-item; kept for call-site compatibility. */
  deleteMode?: boolean;
  onDeleteModeChange?: (active: boolean) => void;
  onComposingChange?: (composing: boolean) => void;
  onCancelNewItem?: () => void;
  sectionRootRef?: RefObject<HTMLElement | null>;
  onGlobalHasChangesChange?: (hasChanges: boolean) => void;
  onRegisterGlobalConfirm?: (confirm: (() => Promise<void>) | null) => void;
}) {
  void _sectionRootRef;
  const canEdit = Boolean(onItemSave);
  const canDelete = Boolean(onRemoveItem);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<PortfolioTeamDraft[]>(() => items.map(toDraft));
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [socialUrlErrors, setSocialUrlErrors] = useState<Record<string, string>>({});
  const previousCountRef = useRef(items.length);
  const editingCardRef = useRef<HTMLElement | null>(null);
  const cancelEditRef = useRef<() => Promise<void>>(async () => undefined);

  const syncDraftsFromItems = () => {
    setDrafts(items.map(toDraft));
  };

  const composing = editingIndex != null;
  const composingNewItem =
    composing &&
    editingIndex != null &&
    isTeamEmpty(
      toDraft(
        items[editingIndex] ?? {
          id: '',
          name: '',
          responsibility: '',
          imageUrl: '',
          socialLinks: [],
        }
      )
    );

  useEffect(() => {
    onComposingChange?.(composingNewItem);
    return () => onComposingChange?.(false);
  }, [composingNewItem, onComposingChange]);

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
    const previous = previousCountRef.current;
    previousCountRef.current = items.length;
    if (!composeAdd || fieldSaving) return;
    if (items.length > previous) {
      const nextIndex = items.length - 1;
      if (isTeamEmpty(toDraft(items[nextIndex]))) {
        setDrafts(items.map(toDraft));
        setEditingIndex(nextIndex);
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
    if (isTeamEmpty(toDraft(items[lastIndex]))) {
      setDrafts(items.map(toDraft));
      setEditingIndex(lastIndex);
      setPendingDeleteIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAdd, items.length]);

  const startEdit = (index: number) => {
    if (!canEdit || fieldSaving) return;
    setPendingDeleteIndex(null);
    setSocialUrlErrors({});
    syncDraftsFromItems();
    setEditingIndex(index);
  };

  const cancelEdit = async () => {
    if (fieldSaving || editingIndex == null) return;
    const original = items[editingIndex];
    const wasEmpty = original ? isTeamEmpty(toDraft(original)) : true;
    setEditingIndex(null);
    setSocialUrlErrors({});
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

  const updateDraft = (index: number, patch: Partial<PortfolioTeamDraft>) => {
    if (patch.socialLinks) {
      setSocialUrlErrors((prev) => {
        const next = { ...prev };
        for (const link of patch.socialLinks ?? []) {
          delete next[link.id];
        }
        return next;
      });
    }
    setDrafts((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const confirmEdit = async () => {
    if (editingIndex == null || !onItemSave || fieldSaving) return;
    const draft = drafts[editingIndex];
    if (!draft) return;
    const nextUrlErrors: Record<string, string> = {};
    for (const link of draft.socialLinks) {
      const message = getTeamSocialUrlFieldError(link.url, inferTeamSocialPlatform(link.url));
      if (message) nextUrlErrors[link.id] = message;
    }
    if (Object.keys(nextUrlErrors).length > 0) {
      setSocialUrlErrors(nextUrlErrors);
      return;
    }
    setSocialUrlErrors({});
    const normalized = normalizeDraft(draft);
    const cardHasChanges = !draftsEqual(draft, toDraft(items[editingIndex]));
    if (isTeamIncomplete(draft)) {
      setEditingIndex(null);
      if (isTeamEmpty(draft)) {
        onCancelNewItem?.();
        return;
      }
      if (onRemoveItem) await onRemoveItem(editingIndex);
      return;
    }
    if (!cardHasChanges) {
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
        index === editingIndex ||
        (Boolean(item.name.trim()) && Boolean(item.responsibility.trim())) ||
        composeAdd
    );

  const shellClass =
    '-mx-5 -mb-1 -mt-5 px-5 py-5 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-6';

  if (visibleEntries.length === 0 && !composeAdd) {
    return (
      <div className={`${shellClass} py-5`}>
        <ProfileSectionItemCount
          count={items.filter((item) => item.name.trim() && item.responsibility.trim()).length}
          limit={MAX_TEAM}
          unit="team members"
          className="mb-6"
        />
        <p className="text-center text-sm italic text-neutral-500 dark:text-neutral-400">
          No team members yet. Click Add member to create one.
        </p>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <ProfileSectionItemCount
        count={items.filter((item) => item.name.trim() && item.responsibility.trim()).length}
        limit={MAX_TEAM}
        unit="team members"
        className="mb-4"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleEntries.map(({ item, index }) => {
          const draft = drafts[index] ?? toDraft(item);
          const editing = Boolean(canEdit && editingIndex === index);
          const display = editing ? draft : toDraft(item);
          const displayLinks = display.socialLinks.filter((link) =>
            editing ? true : link.url.trim().length > 0
          );
          const confirming = fieldSaving && editingIndex === index;
          const cardHasChanges = editingIndex === index && !draftsEqual(draft, toDraft(item));
          const showConfirmActions = Boolean(editing && onItemSave);
          const showCardChrome = Boolean((canEdit || canDelete) && !editing);
          const titleTrimmed = draft.name.trim();

          return (
            <article
              key={item.id}
              ref={editing ? editingCardRef : undefined}
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white p-0 dark:border-white/[0.08] dark:bg-[#121212]"
            >
              {showConfirmActions ? (
                <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5">
                  <IconButton
                    label={
                      titleTrimmed
                        ? isTeamIncomplete(draft)
                          ? 'Name and role required'
                          : cardHasChanges
                            ? 'Confirm member'
                            : 'No changes'
                        : 'Discard empty member'
                    }
                    tone={
                      titleTrimmed && !isTeamIncomplete(draft) && cardHasChanges
                        ? 'confirm'
                        : 'neutral'
                    }
                    disabled={
                      fieldSaving ||
                      (Boolean(titleTrimmed) && (!cardHasChanges || isTeamIncomplete(draft)))
                    }
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
                        label="Confirm delete member"
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
                          label="Edit member"
                          disabled={fieldSaving}
                          onClick={() => startEdit(index)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                        </IconButton>
                      ) : null}
                      {canDelete ? (
                        <IconButton
                          label="Delete member"
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
                  <>
                    <TeamPhotoEditor
                      imageUrl={draft.imageUrl}
                      onChange={(imageUrl) => updateDraft(index, { imageUrl })}
                      disabled={fieldSaving}
                    />
                    <div className="space-y-4 px-5 pb-5 pt-4">
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={draft.name}
                          onChange={(event) => updateDraft(index, { name: event.target.value })}
                          placeholder="Name"
                          className={`${portfolioInlineInputClass} w-full text-lg font-bold tracking-[-0.02em]`}
                          autoFocus={editingIndex === index}
                          disabled={fieldSaving}
                        />
                        <input
                          type="text"
                          value={draft.responsibility}
                          onChange={(event) =>
                            updateDraft(index, { responsibility: event.target.value })
                          }
                          placeholder="e.g. Art director"
                          className={`${portfolioInlineInputClass} w-full text-sm font-medium text-neutral-500`}
                          disabled={fieldSaving}
                        />
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          Social links
                        </p>
                        <TeamSocialLinksEditor
                          links={draft.socialLinks}
                          onChange={(socialLinks) => updateDraft(index, { socialLinks })}
                          disabled={fieldSaving}
                          urlErrors={socialUrlErrors}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col">
                    <TeamPhotoDisplay name={item.name} imageUrl={item.imageUrl} />
                    <div className="px-5 pt-4">
                      <p className="text-2xl font-bold tracking-[-0.02em] text-[#0f172a] dark:text-white">
                        {item.name.trim() || (
                          <span className="italic text-neutral-400">Untitled member</span>
                        )}
                      </p>
                      {item.responsibility.trim() ? (
                        <p className="mt-1.5 text-base font-medium text-neutral-500 dark:text-neutral-400">
                          {item.responsibility.trim()}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-base italic text-neutral-400">No role</p>
                      )}
                    </div>
                    <div className="mt-auto px-5 pb-5">
                      <TeamSocialIconRow links={displayLinks} name={item.name} />
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
