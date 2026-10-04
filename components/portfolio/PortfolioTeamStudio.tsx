'use client';

import { memo, useCallback, useState, type DragEvent, type ReactNode } from 'react';
import { UserFacingError } from '@/lib/api-error';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faArrowsRotate, faChevronLeft, faChevronRight, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import {
  getTeamSocialUrlFieldError,
  inferTeamSocialPlatform,
  toAbsoluteHttpUrl,
} from '@/components/creator/studio/profile-form-schema';
import { MAX_TEAM } from '@/components/creator/studio/ProfileTeamField';
import { TeamSocialGlyph } from '@/components/portfolio/PortfolioTeamChrome';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_EMPTY_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_SECONDARY_CLASS,
  StudioIconAction,
  StudioRemoveButton,
  StudioSaveChrome,
  StudioSectionHeader,
  StudioUnderline,
  useInlineStudio,
  useStudioFold,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type TeamLink = { id: string; platform: string; label: string; url: string; sortOrder: number };
type TeamMember = { name: string; responsibility: string; imageUrl: string; socialLinks: TeamLink[] };
type TeamRow = TeamMember & { key: string };
type TeamDraft = { items: TeamRow[] };
type RowChangeHandler = (key: string, patch: Partial<TeamMember>) => void;

const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
const MAX_SOCIAL_LINKS = 6;
const MAX_NAME = 80;
const MAX_ROLE = 120;

let rowSeq = 0;
const nextRowKey = () => `team-${++rowSeq}`;

function normalizeLinkUrl(raw: string): string {
  const url = raw.trim();
  if (!url || url.includes('@')) return url;
  return toAbsoluteHttpUrl(url) ?? url;
}

function cleanItems(rows: TeamRow[]): TeamMember[] {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      responsibility: row.responsibility.trim(),
      imageUrl: row.imageUrl.trim(),
      socialLinks: row.socialLinks
        .filter((link) => link.url.trim())
        .map((link, index) => {
          const url = normalizeLinkUrl(link.url);
          return { id: link.id, platform: inferTeamSocialPlatform(url), label: link.label.trim(), url, sortOrder: index };
        }),
    }))
    .filter((row) => row.name || row.responsibility || row.imageUrl || row.socialLinks.length > 0);
}

function teamSignature(_key: keyof TeamDraft, value: TeamDraft[keyof TeamDraft]): string {
  return JSON.stringify(
    cleanItems(value).map(({ name, responsibility, imageUrl, socialLinks }) => ({
      name,
      responsibility,
      imageUrl,
      links: socialLinks.map((link) => link.url),
    }))
  );
}

/** Solid chip that stays legible on top of any photo. */
function PhotoChip({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur transition-colors duration-200 disabled:pointer-events-none disabled:opacity-30 ${
        danger ? 'hover:bg-red-500 hover:text-white' : 'hover:bg-neutral-900 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

const HOVER_REVEAL_CLASS =
  'opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover/item:opacity-100 sm:group-focus-within/item:opacity-100';

function MemberPhoto({
  row,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  row: TeamRow;
  index: number;
  total: number;
  onChange: RowChangeHandler;
  onMove: (key: string, direction: -1 | 1) => void;
  onRemove: (key: string) => void;
}) {
  const { inputRef, uploading, uploadError, pickFile, onFileChange, uploadFile } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => onChange(row.key, { imageUrl: url.trim() }),
  });
  const [dragging, setDragging] = useState(false);
  const hasPhoto = Boolean(row.imageUrl.trim());
  const initial = row.name.trim().charAt(0).toUpperCase();

  const dropHandlers = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!uploading) setDragging(true);
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file && !uploading) void uploadFile(file);
    },
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={PHOTO_ACCEPT} className="hidden" onChange={onFileChange} />
      <div
        {...dropHandlers}
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-black/[0.03] transition-colors dark:bg-white/[0.04] ${
          dragging ? 'border-[#FF5722]' : 'border-black/[0.04] dark:border-white/[0.04]'
        }`}
      >
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.imageUrl} alt="" className="h-full w-full object-cover object-top" />
        ) : (
          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-center transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
          >
            {initial ? (
              <span className="text-4xl font-semibold text-neutral-300 dark:text-neutral-600">{initial}</span>
            ) : (
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            )}
            <span className={`text-[13px] ${STUDIO_SECONDARY_CLASS}`}>
              Drop a photo, or <span className="underline underline-offset-4">browse</span>
            </span>
          </button>
        )}

        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-black/55 via-black/20 via-45% to-transparent ${HOVER_REVEAL_CLASS}`}
        />

        <div className={`absolute inset-x-3 top-3 flex justify-between ${HOVER_REVEAL_CLASS}`}>
          <div className="flex gap-1.5">
            <PhotoChip label="Move earlier" disabled={index === 0} onClick={() => onMove(row.key, -1)}>
              <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
            </PhotoChip>
            <PhotoChip label="Move later" disabled={index >= total - 1} onClick={() => onMove(row.key, 1)}>
              <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
            </PhotoChip>
          </div>
          <div className="flex gap-1.5">
            <PhotoChip label={hasPhoto ? 'Replace photo' : 'Add photo'} disabled={uploading} onClick={pickFile}>
              <FontAwesomeIcon icon={hasPhoto ? faArrowsRotate : faPlus} className="h-3 w-3" />
            </PhotoChip>
            <PhotoChip label="Remove member" danger disabled={uploading} onClick={() => onRemove(row.key)}>
              <FontAwesomeIcon icon={faTrashCan} className="h-3.5 w-3.5" />
            </PhotoChip>
          </div>
        </div>

        {uploading || dragging ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 text-sm font-medium text-white">
            {uploading ? <LoadingSpinner size="sm" /> : null}
            {uploading ? 'Uploading…' : 'Drop to replace'}
          </div>
        ) : null}
      </div>
      {uploadError ? <p className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">{uploadError}</p> : null}
    </>
  );
}

function MemberLinks({
  links,
  memberLabel,
  onChange,
}: {
  links: TeamLink[];
  memberLabel: string;
  onChange: (next: TeamLink[]) => void;
}) {
  const [open, setOpen] = useStudioFold();
  const [focusId, setFocusId] = useState<string | null>(null);

  const add = () => {
    const id = crypto.randomUUID();
    setFocusId(id);
    setOpen(true);
    onChange([...links, { id, platform: 'WEBSITE', label: '', url: '', sortOrder: links.length }]);
  };

  const editLink = (id: string) => {
    setFocusId(id);
    setOpen(true);
  };

  if (!open) {
    const filled = links.filter((link) => link.url.trim());
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {filled.map((link) => {
          const platform = inferTeamSocialPlatform(link.url);
          const error = getTeamSocialUrlFieldError(link.url, platform);
          return (
            <button
              key={link.id}
              type="button"
              title={error ?? link.url}
              aria-label={`Edit ${link.url}`}
              onClick={() => editLink(link.id)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ${
                error
                  ? 'bg-red-500/10 text-red-600 ring-1 ring-red-500/40 dark:text-red-400'
                  : 'bg-black/[0.05] text-neutral-600 hover:bg-black/[0.1] hover:text-black dark:bg-white/[0.07] dark:text-neutral-300 dark:hover:bg-white/[0.14] dark:hover:text-white'
              }`}
            >
              <TeamSocialGlyph platform={platform} className="h-4 w-4" />
            </button>
          );
        })}
        {filled.length < MAX_SOCIAL_LINKS ? (
          <button
            type="button"
            title="Add link"
            aria-label={`Add link for ${memberLabel}`}
            onClick={add}
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-full border border-dashed border-neutral-300 transition-colors duration-200 hover:border-[#FF5722] hover:text-[#FF5722] dark:border-white/15 ${
              filled.length === 0 ? 'px-3.5 text-[13px]' : 'w-9'
            } ${STUDIO_SECONDARY_CLASS}`}
          >
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            {filled.length === 0 ? 'Add link' : null}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="mt-4 space-y-1"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      {links.map((link, linkIndex) => {
        const platform = inferTeamSocialPlatform(link.url);
        const error = link.url.trim() ? getTeamSocialUrlFieldError(link.url, platform) : null;
        return (
          <div key={link.id} className="group/row">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-400">
                <TeamSocialGlyph platform={platform} className="h-3.5 w-3.5" />
              </span>
              <StudioUnderline quiet className="min-w-0 flex-1">
                <input
                  type="text"
                  inputMode="url"
                  value={link.url}
                  autoFocus={link.id === focusId}
                  placeholder="Profile link or email"
                  aria-label={`Link ${linkIndex + 1} for ${memberLabel}`}
                  aria-invalid={error ? true : undefined}
                  autoComplete="off"
                  onChange={(event) => {
                    const url = event.currentTarget.value;
                    onChange(links.map((item, index) => (index === linkIndex ? { ...item, url } : item)));
                  }}
                  className={`${STUDIO_BARE_INPUT_CLASS} text-[14px] text-neutral-700 dark:text-neutral-300`}
                />
              </StudioUnderline>
              <StudioRemoveButton
                label={`Remove link ${linkIndex + 1}`}
                onClick={() => onChange(links.filter((_, index) => index !== linkIndex))}
              />
            </div>
            {error ? <p className="pl-10 text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
          </div>
        );
      })}
      <div className="flex items-center justify-between pt-1">
        {links.length < MAX_SOCIAL_LINKS ? (
          <button
            type="button"
            onClick={add}
            className={`inline-flex items-center gap-2 text-[13px] transition-colors hover:text-[#FF5722] ${STUDIO_SECONDARY_CLASS}`}
          >
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            Add link
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[13px] font-medium text-black transition-colors hover:text-[#FF5722] dark:text-neutral-100"
        >
          Done
        </button>
      </div>
    </div>
  );
}

const MemberCard = memo(function MemberCard({
  row,
  index,
  total,
  autoFocus,
  onChange,
  onMove,
  onRemove,
}: {
  row: TeamRow;
  index: number;
  total: number;
  autoFocus: boolean;
  onChange: RowChangeHandler;
  onMove: (key: string, direction: -1 | 1) => void;
  onRemove: (key: string) => void;
}) {
  const memberLabel = row.name.trim() || `member ${index + 1}`;
  const missingRole = Boolean(row.name.trim()) && !row.responsibility.trim();

  return (
    <li className="group/item min-w-0">
      <MemberPhoto row={row} index={index} total={total} onChange={onChange} onMove={onMove} onRemove={onRemove} />

      <div className="mt-4">
        <StudioUnderline quiet>
          <input
            type="text"
            value={row.name}
            maxLength={MAX_NAME}
            placeholder="Full name"
            aria-label={`Name of member ${index + 1}`}
            autoFocus={autoFocus}
            autoComplete="off"
            onChange={(event) => onChange(row.key, { name: event.currentTarget.value })}
            className={`${STUDIO_BARE_INPUT_CLASS} text-[17px] font-semibold tracking-[-0.01em] text-black dark:text-neutral-100`}
          />
        </StudioUnderline>
        <StudioUnderline quiet className="mt-1">
          <input
            type="text"
            value={row.responsibility}
            maxLength={MAX_ROLE}
            placeholder="Role, e.g. Art director"
            aria-label={`Role of ${memberLabel}`}
            autoComplete="off"
            onChange={(event) => onChange(row.key, { responsibility: event.currentTarget.value })}
            className={`${STUDIO_BARE_INPUT_CLASS} text-[15px] text-neutral-500 dark:text-neutral-400`}
          />
        </StudioUnderline>
        {missingRole ? (
          <p className="mt-1 text-[13px] text-neutral-400 dark:text-neutral-500">A role is required.</p>
        ) : null}
      </div>

      <MemberLinks
        links={row.socialLinks}
        memberLabel={memberLabel}
        onChange={(socialLinks) => onChange(row.key, { socialLinks })}
      />
    </li>
  );
});

function TeamGrid({ getDraft, change }: { getDraft: () => TeamDraft; change: StudioChangeHandler<TeamDraft> }) {
  const [rows, setRows] = useState(() => getDraft().items);
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const commitRows = useCallback(
    (next: TeamRow[]) => {
      setRows(next);
      change('items', next);
    },
    [change]
  );

  const updateRow = useCallback<RowChangeHandler>(
    (key, patch) => commitRows(getDraft().items.map((row) => (row.key === key ? { ...row, ...patch } : row))),
    [commitRows, getDraft]
  );

  const moveRow = useCallback(
    (key: string, direction: -1 | 1) => {
      const next = [...getDraft().items];
      const from = next.findIndex((row) => row.key === key);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= next.length) return;
      [next[from], next[to]] = [next[to], next[from]];
      commitRows(next);
    },
    [commitRows, getDraft]
  );

  const removeRow = useCallback(
    (key: string) => commitRows(getDraft().items.filter((row) => row.key !== key)),
    [commitRows, getDraft]
  );

  const add = () => {
    if (rows.length >= MAX_TEAM) return;
    const row: TeamRow = { key: nextRowKey(), name: '', responsibility: '', imageUrl: '', socialLinks: [] };
    setFreshKey(row.key);
    commitRows([...rows, row]);
  };

  return (
    <section className="pb-10 pt-3" aria-label="Team">
      <StudioSectionHeader label={`Members · ${String(rows.length).padStart(2, '0')}`}>
        <span className={STUDIO_SECONDARY_CLASS}>
          {rows.length} of {MAX_TEAM}
        </span>
        <StudioIconAction icon="add" label="Add member" onClick={add} disabled={rows.length >= MAX_TEAM} />
      </StudioSectionHeader>

      {rows.length === 0 ? (
        <button type="button" onClick={add} className={`py-8 ${STUDIO_EMPTY_CLASS} transition-colors hover:text-[#FF5722]`}>
          No member yet — introduce the people behind your work.
        </button>
      ) : (
        <ul style={STUDIO_FLOAT_IN_STYLE} className="grid grid-cols-1 gap-x-8 gap-y-12 pt-2 sm:grid-cols-2">
          {rows.map((row, index) => (
            <MemberCard
              key={row.key}
              row={row}
              index={index}
              total={rows.length}
              autoFocus={row.key === freshKey}
              onChange={updateRow}
              onMove={moveRow}
              onRemove={removeRow}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/** Team edited inline: member cards with photo, name, role and links, saved through the floating bar. */
export function PortfolioTeamStudio({
  items,
  onSave,
}: {
  items: TeamMember[];
  onSave: (next: TeamMember[]) => Promise<void>;
}) {
  const [initial] = useState<TeamDraft>(() => ({
    items: items
      .filter((item) => item.name.trim() || item.responsibility.trim())
      .slice(0, MAX_TEAM)
      .map((item) => ({ ...item, socialLinks: item.socialLinks.map((link) => ({ ...link })), key: nextRowKey() })),
  }));

  const save = useCallback(
    async (draft: TeamDraft) => {
      const cleaned = cleanItems(draft.items);
      if (cleaned.some((member) => !member.name || !member.responsibility)) {
        throw new UserFacingError('Each member needs a name and a role.');
      }
      const linkError = cleaned
        .flatMap((member) => member.socialLinks)
        .map((link) => getTeamSocialUrlFieldError(link.url, link.platform))
        .find(Boolean);
      if (linkError) throw new UserFacingError(linkError);
      await onSave(cleaned);
    },
    [onSave]
  );

  const studio = useInlineStudio({ initial, onSave: save, signature: teamSignature });

  return (
    <>
      <TeamGrid key={studio.revision} getDraft={studio.getDraft} change={studio.change} />
      <StudioSaveChrome studio={studio} />
    </>
  );
}
