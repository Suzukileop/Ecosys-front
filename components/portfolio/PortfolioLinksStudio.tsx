'use client';

import { memo, useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faArrowUpRightFromSquare,
  faCamera,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import {
  deriveProfileLinkLabel,
  getHttpUrlFieldError,
  toAbsoluteHttpUrl,
} from '@/components/creator/studio/profile-form-schema';
import { LinkBrandIcon } from '@/components/portfolio/PortfolioLinksChrome';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_EMPTY_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_ROW_RULE,
  STUDIO_SECONDARY_CLASS,
  StudioIconAction,
  StudioRemoveButton,
  StudioSaveChrome,
  StudioSectionHeader,
  StudioUnderline,
  useInlineStudio,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type LinkItem = { id?: string; url: string; type: string; platform: string | null; iconUrl: string | null };
type LinkRow = LinkItem & { key: string };
type LinksDraft = { items: LinkRow[] };
type RowChangeHandler = (key: string, patch: Partial<LinkItem>) => void;

const MAX_PROFILE_LINKS = 10;
const ICON_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

let rowSeq = 0;
const nextRowKey = () => `link-${++rowSeq}`;

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  return toAbsoluteHttpUrl(trimmed) ?? trimmed;
}

function cleanItems(rows: LinkRow[]): LinkItem[] {
  return rows
    .filter((row) => row.url.trim())
    .map(({ id, url, type, platform, iconUrl }) => ({
      id,
      url: normalizeUrl(url),
      type: type || 'CUSTOM',
      platform,
      iconUrl: iconUrl?.trim() || null,
    }));
}

function linksSignature(_key: keyof LinksDraft, value: LinksDraft[keyof LinksDraft]): string {
  return JSON.stringify(cleanItems(value).map(({ url, iconUrl }) => ({ url, iconUrl })));
}

const ROW_ACTION_CLASS =
  'inline-flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-black/[0.05] hover:text-black disabled:pointer-events-none disabled:opacity-0 dark:text-neutral-500 dark:hover:bg-white/[0.08] dark:hover:text-white';

const LinkRowView = memo(function LinkRowView({
  row,
  index,
  total,
  autoFocus,
  onChange,
  onMove,
  onRemove,
}: {
  row: LinkRow;
  index: number;
  total: number;
  autoFocus: boolean;
  onChange: RowChangeHandler;
  onMove: (key: string, direction: -1 | 1) => void;
  onRemove: (key: string) => void;
}) {
  const { inputRef, uploading, uploadError, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => onChange(row.key, { iconUrl: url.trim() || null }),
  });

  const [touched, setTouched] = useState(!autoFocus);
  const url = row.url.trim();
  const invalid = url ? getHttpUrlFieldError(url) : null;
  const error = touched ? invalid : null;
  const hostname = url ? deriveProfileLinkLabel(url) : '';
  const href = url && !invalid ? normalizeUrl(url) : '';

  return (
    <li className={`group/row grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-4 py-5 first:pt-1 ${STUDIO_ROW_RULE}`}>
      <input ref={inputRef} type="file" accept={ICON_ACCEPT} className="hidden" onChange={onFileChange} />
      <button
        type="button"
        onClick={pickFile}
        disabled={uploading || !url}
        title={url ? (row.iconUrl ? 'Replace icon' : 'Upload your own icon') : undefined}
        aria-label={row.iconUrl ? 'Replace icon' : 'Upload your own icon'}
        className="group/icon relative inline-flex h-12 w-12 items-center justify-center rounded-full disabled:cursor-default"
      >
        {uploading ? (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
            <LoadingSpinner size="sm" />
          </span>
        ) : url ? (
          <LinkBrandIcon url={url} platform={row.platform} iconUrl={row.iconUrl} />
        ) : (
          <span className="h-12 w-12 rounded-full border border-dashed border-neutral-300 dark:border-white/15" />
        )}
        {url && !uploading ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity duration-200 group-hover/icon:opacity-100">
            <FontAwesomeIcon icon={faCamera} className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </button>

      <div className="min-w-0">
        <p className={`truncate text-base font-semibold ${hostname ? 'text-black dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'}`}>
          {hostname || 'New link'}
        </p>
        <StudioUnderline quiet className="mt-0.5">
          <input
            type="text"
            inputMode="url"
            value={row.url}
            placeholder="Paste a link, e.g. linkedin.com/in/you"
            aria-label={`Link ${index + 1}`}
            aria-invalid={error ? true : undefined}
            autoFocus={autoFocus}
            autoComplete="off"
            onChange={(event) => onChange(row.key, { url: event.currentTarget.value })}
            onBlur={() => setTouched(true)}
            className={`${STUDIO_BARE_INPUT_CLASS} truncate text-[14px] ${
              error ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'
            }`}
          />
        </StudioUnderline>
        {error ? <p className="mt-1 text-[13px] text-red-600 dark:text-red-400">{error}</p> : null}
        {uploadError ? <p className="mt-1 text-[13px] text-red-600 dark:text-red-400">{uploadError}</p> : null}
      </div>

      <div className="flex items-center gap-0.5">
        <div className="flex opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100">
          {row.iconUrl ? (
            <button
              type="button"
              title="Use detected icon"
              aria-label="Use detected icon"
              onClick={() => onChange(row.key, { iconUrl: null })}
              className={ROW_ACTION_CLASS}
            >
              <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" />
            </button>
          ) : null}
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title="Open link"
              aria-label={`Open ${hostname}`}
              className={ROW_ACTION_CLASS}
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
            </a>
          ) : null}
          <button
            type="button"
            title="Move up"
            aria-label={`Move link ${index + 1} up`}
            disabled={index === 0}
            onClick={() => onMove(row.key, -1)}
            className={ROW_ACTION_CLASS}
          >
            <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
          </button>
          <button
            type="button"
            title="Move down"
            aria-label={`Move link ${index + 1} down`}
            disabled={index >= total - 1}
            onClick={() => onMove(row.key, 1)}
            className={ROW_ACTION_CLASS}
          >
            <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
          </button>
        </div>
        <StudioRemoveButton label={`Remove link ${index + 1}`} onClick={() => onRemove(row.key)} />
      </div>
    </li>
  );
});

function LinksList({ getDraft, change }: { getDraft: () => LinksDraft; change: StudioChangeHandler<LinksDraft> }) {
  const [rows, setRows] = useState(() => getDraft().items);
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const commitRows = useCallback(
    (next: LinkRow[]) => {
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
    if (rows.length >= MAX_PROFILE_LINKS) return;
    const row: LinkRow = { key: nextRowKey(), url: '', type: 'CUSTOM', platform: null, iconUrl: null };
    setFreshKey(row.key);
    commitRows([...rows, row]);
  };

  return (
    <section className="pb-10 pt-3" aria-label="Links">
      <StudioSectionHeader label={`Links · ${String(rows.length).padStart(2, '0')}`}>
        <span className={STUDIO_SECONDARY_CLASS}>
          {rows.length} of {MAX_PROFILE_LINKS}
        </span>
        <StudioIconAction icon="add" label="Add link" onClick={add} disabled={rows.length >= MAX_PROFILE_LINKS} />
      </StudioSectionHeader>

      {rows.length === 0 ? (
        <button type="button" onClick={add} className={`py-8 ${STUDIO_EMPTY_CLASS} transition-colors hover:text-[#FF5722]`}>
          No link yet — add where people can find you.
        </button>
      ) : (
        <ul style={STUDIO_FLOAT_IN_STYLE}>
          {rows.map((row, index) => (
            <LinkRowView
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

/** Links edited inline: brand icon, detected name and URL per row, saved through the floating bar. */
export function PortfolioLinksStudio({
  items,
  onSave,
}: {
  items: LinkItem[];
  onSave: (next: LinkItem[]) => Promise<void>;
}) {
  const [initial] = useState<LinksDraft>(() => ({
    items: items
      .filter((item) => item.url.trim())
      .slice(0, MAX_PROFILE_LINKS)
      .map((item) => ({ ...item, key: nextRowKey() })),
  }));

  const save = useCallback(
    async (draft: LinksDraft) => {
      const cleaned = cleanItems(draft.items);
      const invalid = cleaned.map((item) => getHttpUrlFieldError(item.url)).find(Boolean);
      if (invalid) throw new Error(invalid);
      await onSave(cleaned);
    },
    [onSave]
  );

  const studio = useInlineStudio({ initial, onSave: save, signature: linksSignature });

  return (
    <>
      <LinksList key={studio.revision} getDraft={studio.getDraft} change={studio.change} />
      <StudioSaveChrome studio={studio} />
    </>
  );
}
