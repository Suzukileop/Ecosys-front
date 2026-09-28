'use client';

import { memo, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type RefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIcons,
  faLayerGroup,
  faList,
  faTable,
  faTableCellsLarge,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import type { StrengthToolLevel } from '@/components/creator/studio/profile-form-schema';
import {
  LEVEL_OPTIONS,
  MAX_DESCRIPTION,
  cleanDraft,
  type PortfolioStrengthDraft,
} from '@/components/portfolio/PortfolioStrengthsChrome';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_BLOCK_CLASS,
  STUDIO_EMPTY_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_GLASS_PANEL_CLASS,
  STUDIO_ROW_RULE,
  STUDIO_SECONDARY_CLASS,
  STUDIO_VALUE_CLASS,
  StudioIconAction,
  StudioRemoveButton,
  StudioSaveChrome,
  StudioSectionHeader,
  StudioUnderline,
  useInlineStudio,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { uploadContentMedia } from '@/lib/marketplace-api';

export type PortfolioSkillVariant = 'stack' | 'tools';

type SkillRow = PortfolioStrengthDraft & { key: string };
type SkillDraft = { items: SkillRow[] };
type RowPatch = Partial<PortfolioStrengthDraft>;
type RowChangeHandler = (key: string, patch: RowPatch) => void;

const MAX_ITEMS = 12;
const VALUE_CLASS = STUDIO_VALUE_CLASS;
const SECONDARY_CLASS = STUDIO_SECONDARY_CLASS;
const EMPTY_CLASS = STUDIO_EMPTY_CLASS;

let rowSeq = 0;
const nextRowKey = () => `skill-${++rowSeq}`;

type SkillView = 'list' | 'icons' | 'grid' | 'table' | 'category';
type ColorMode = 'light' | 'dark';

const SKILL_VIEWS: Array<{ id: SkillView; label: string; icon: IconDefinition }> = [
  { id: 'list', label: 'List — edit', icon: faList },
  { id: 'icons', label: 'Icons only', icon: faIcons },
  { id: 'grid', label: 'Grid', icon: faTableCellsLarge },
  { id: 'table', label: 'Table', icon: faTable },
  { id: 'category', label: 'By category', icon: faLayerGroup },
];

const UNCATEGORIZED = 'Other';
const TILE_CLASS =
  'border border-black/[0.06] transition-colors duration-200 hover:border-black/25 focus-visible:border-[#FF5722] focus-visible:outline-none dark:border-white/[0.08] dark:hover:border-white/30';

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

/** Brand logos need the page mode so near-black / near-white marks stay visible. */
function useColorMode(): ColorMode {
  return useSyncExternalStore(
    subscribeTheme,
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    () => 'light'
  );
}

function displayName(row: SkillRow): string {
  return row.value.trim() || 'Untitled';
}

function groupByCategory(rows: SkillRow[]): Array<{ category: string; rows: SkillRow[] }> {
  const buckets = new Map<string, { category: string; rows: SkillRow[] }>();
  for (const row of rows) {
    const category = row.category.trim() || UNCATEGORIZED;
    const key = category.toLocaleLowerCase();
    const bucket = buckets.get(key);
    if (bucket) bucket.rows.push(row);
    else buckets.set(key, { category, rows: [row] });
  }
  return [...buckets.values()].sort((a, b) => {
    if (a.category === UNCATEGORIZED) return 1;
    if (b.category === UNCATEGORIZED) return -1;
    return a.category.localeCompare(b.category, undefined, { sensitivity: 'base' });
  });
}

function emptyRow(): SkillRow {
  return {
    key: nextRowKey(),
    value: '',
    description: '',
    category: '',
    level: null,
    useCases: [],
    experienceYears: null,
    experienceLabel: '',
    currentlyUsed: null,
    iconUrl: null,
  };
}

export function toStrengthDraft(item: {
  value?: string | null;
  description?: string | null;
  category?: string | null;
  level?: StrengthToolLevel | null;
  useCases?: string[] | null;
  experienceYears?: number | null;
  experienceLabel?: string | null;
  currentlyUsed?: boolean | null;
  iconUrl?: string | null;
}): PortfolioStrengthDraft {
  return {
    value: item.value ?? '',
    description: item.description ?? '',
    category: item.category ?? '',
    level: item.level ?? null,
    useCases: item.useCases ?? [],
    experienceYears: item.experienceYears ?? null,
    experienceLabel: item.experienceLabel ?? '',
    currentlyUsed: item.currentlyUsed ?? null,
    iconUrl: item.iconUrl ?? null,
  };
}

function cleanRows(rows: SkillRow[]): PortfolioStrengthDraft[] {
  return rows
    .map(({ key: _key, ...row }) => cleanDraft(row, { stripUseCases: true }))
    .filter((row) => row.value.length > 0);
}

function levelLabel(level: StrengthToolLevel | null): string | null {
  return LEVEL_OPTIONS.find((option) => option.value === level)?.label ?? null;
}

/** Closes a popover on outside click or Escape. */
function useDismiss(open: boolean, close: () => void, rootRef: RefObject<HTMLElement | null>) {
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeRef.current();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, rootRef]);
}

/** Quiet level label that opens a small glass list — the row stays a single line. */
function LevelPicker({
  value,
  onChange,
}: {
  value: StrengthToolLevel | null;
  onChange: (next: StrengthToolLevel | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), rootRef);

  const label = levelLabel(value);
  const options: Array<{ value: StrengthToolLevel | null; label: string }> = [
    ...LEVEL_OPTIONS,
    { value: null, label: 'No level' },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 text-[14px] transition-colors duration-200 hover:text-black dark:hover:text-white ${
          label ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'
        }`}
      >
        {label ?? 'Level'}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Level"
          style={STUDIO_FLOAT_IN_STYLE}
          className={`${STUDIO_GLASS_PANEL_CLASS} absolute right-0 top-full z-50 mt-2 w-40 p-1.5`}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.label} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[14px] transition-colors duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] ${
                    selected ? 'font-semibold text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {option.label}
                  {selected ? <span aria-hidden className="h-1 w-1 rounded-full bg-[#FF5722]" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Brand-coloured logo; clicking it uploads a custom one. */
function SkillLogo({
  name,
  iconUrl,
  colorMode,
  onChange,
}: {
  name: string;
  iconUrl: string | null | undefined;
  colorMode: ColorMode;
  onChange: (next: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      onChange(await uploadContentMedia(file));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to upload logo.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={(event) => void onFileChange(event)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title={error ?? 'Replace logo'}
        aria-label={`Replace logo for ${name || 'item'}`}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40"
      >
        {uploading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <CreatorToolLogo label={name || '?'} iconUrl={iconUrl} size={28} colorMode={colorMode} />
        )}
      </button>
    </>
  );
}

const SkillRowView = memo(function SkillRowView({
  row,
  variant,
  autoFocus,
  colorMode,
  onChange,
  onRemove,
}: {
  row: SkillRow;
  variant: PortfolioSkillVariant;
  autoFocus: boolean;
  colorMode: ColorMode;
  onChange: RowChangeHandler;
  onRemove: (key: string) => void;
}) {
  const patch = (next: RowPatch) => onChange(row.key, next);
  const name = row.value.trim();

  return (
    <li
      className={`group/row grid grid-cols-1 gap-x-8 gap-y-1 py-4 first:pt-1 sm:grid-cols-[11rem_minmax(0,1fr)] ${STUDIO_ROW_RULE}`}
    >
      <StudioUnderline quiet className="self-start sm:pt-1">
        <textarea
          value={row.category}
          maxLength={80}
          rows={1}
          placeholder="Category"
          aria-label="Category"
          onChange={(event) => patch({ category: event.currentTarget.value.replace(/\n/g, ' ') })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.preventDefault();
          }}
          className={`${STUDIO_BARE_INPUT_CLASS} ${SECONDARY_CLASS} resize-none break-words leading-snug [field-sizing:content]`}
        />
      </StudioUnderline>

      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <SkillLogo
            name={name}
            iconUrl={row.iconUrl}
            colorMode={colorMode}
            onChange={(iconUrl) => patch({ iconUrl })}
          />
          <StudioUnderline quiet className="flex-1">
            <input
              type="text"
              value={row.value}
              placeholder={variant === 'stack' ? 'Technology' : 'Tool'}
              aria-label="Name"
              autoFocus={autoFocus}
              onChange={(event) => patch({ value: event.currentTarget.value })}
              className={`${STUDIO_BARE_INPUT_CLASS} ${VALUE_CLASS}`}
            />
          </StudioUnderline>
          <LevelPicker value={row.level} onChange={(level) => patch({ level })} />
          <StudioRemoveButton label={`Remove ${name || 'item'}`} onClick={() => onRemove(row.key)} />
        </div>

        <StudioUnderline quiet className="mt-1 pl-10">
          <textarea
            value={row.description}
            maxLength={MAX_DESCRIPTION}
            rows={1}
            placeholder="How you use it"
            aria-label="Description"
            onChange={(event) => patch({ description: event.currentTarget.value })}
            className={`${STUDIO_BARE_INPUT_CLASS} resize-none leading-relaxed [field-sizing:content] ${SECONDARY_CLASS}`}
          />
        </StudioUnderline>
      </div>
    </li>
  );
});

function SkillViewSwitch({
  value,
  views,
  onChange,
}: {
  value: SkillView;
  views: typeof SKILL_VIEWS;
  onChange: (next: SkillView) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), rootRef);
  const current = views.find((view) => view.id === value) ?? views[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`View: ${current.label}`}
        title={`View: ${current.label}`}
        onClick={() => setOpen(!open)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border pl-3 pr-2 transition-colors duration-200 ${
          open
            ? 'border-neutral-900 text-black dark:border-white dark:text-white'
            : 'border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-black dark:border-white/15 dark:text-neutral-300 dark:hover:border-white/40 dark:hover:text-white'
        }`}
      >
        <FontAwesomeIcon icon={current.icon} className="h-3 w-3" fixedWidth />
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="View"
          style={STUDIO_FLOAT_IN_STYLE}
          className={`${STUDIO_GLASS_PANEL_CLASS} absolute right-0 top-full z-50 mt-2 w-48 p-1.5`}
        >
          {views.map((view) => {
            const selected = view.id === value;
            return (
              <li key={view.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(view.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] transition-colors duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] ${
                    selected ? 'font-semibold text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <FontAwesomeIcon icon={view.icon} className="h-3 w-3 opacity-70" fixedWidth />
                  <span className="flex-1">{view.label}</span>
                  {selected ? <span aria-hidden className="h-1 w-1 rounded-full bg-[#FF5722]" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function metaLine(row: SkillRow): string {
  return [row.category.trim(), levelLabel(row.level) ?? ''].filter(Boolean).join(' · ');
}

/** Read-only overviews; picking an item jumps back to the list with that row focused. */
function SkillOverview({
  view,
  rows,
  variant,
  colorMode,
  onOpen,
}: {
  view: Exclude<SkillView, 'list'>;
  rows: SkillRow[];
  variant: PortfolioSkillVariant;
  colorMode: ColorMode;
  onOpen: (key: string) => void;
}) {
  if (view === 'icons') {
    return (
      <ul style={STUDIO_FLOAT_IN_STYLE} className="flex flex-wrap gap-3 py-2">
        {rows.map((row) => (
          <li key={row.key}>
            <button
              type="button"
              title={displayName(row)}
              aria-label={`Edit ${displayName(row)}`}
              onClick={() => onOpen(row.key)}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${TILE_CLASS}`}
            >
              <CreatorToolLogo label={displayName(row)} iconUrl={row.iconUrl} size={34} colorMode={colorMode} />
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (view === 'grid') {
    return (
      <ul style={STUDIO_FLOAT_IN_STYLE} className="grid grid-cols-2 gap-3 py-2 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((row) => (
          <li key={row.key}>
            <button
              type="button"
              aria-label={`Edit ${displayName(row)}`}
              onClick={() => onOpen(row.key)}
              className={`flex w-full flex-col items-start gap-5 rounded-2xl p-4 text-left ${TILE_CLASS}`}
            >
              <CreatorToolLogo label={displayName(row)} iconUrl={row.iconUrl} size={36} colorMode={colorMode} />
              <span className="block w-full min-w-0">
                <span className={`block truncate ${VALUE_CLASS}`}>{displayName(row)}</span>
                <span className={`block truncate ${SECONDARY_CLASS}`}>{metaLine(row) || '—'}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (view === 'table') {
    const headClass = `pb-3 pr-6 font-normal ${SECONDARY_CLASS}`;
    return (
      <div style={STUDIO_FLOAT_IN_STYLE} className="overflow-x-auto py-2">
        <table className="w-full min-w-[32rem] text-left">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.06]">
              <th scope="col" className={headClass}>
                {variant === 'stack' ? 'Technology' : 'Tool'}
              </th>
              <th scope="col" className={headClass}>
                Category
              </th>
              <th scope="col" className={headClass}>
                Level
              </th>
              <th scope="col" className={`${headClass} hidden md:table-cell`}>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                onClick={() => onOpen(row.key)}
                className="cursor-pointer border-b border-black/[0.06] transition-colors duration-200 hover:bg-black/[0.02] dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
              >
                <td className="py-3 pr-6">
                  <button
                    type="button"
                    aria-label={`Edit ${displayName(row)}`}
                    className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40"
                  >
                    <CreatorToolLogo label={displayName(row)} iconUrl={row.iconUrl} size={24} colorMode={colorMode} />
                    <span className={VALUE_CLASS}>{displayName(row)}</span>
                  </button>
                </td>
                <td className={`py-3 pr-6 ${SECONDARY_CLASS}`}>{row.category.trim() || '—'}</td>
                <td className={`whitespace-nowrap py-3 pr-6 ${SECONDARY_CLASS}`}>{levelLabel(row.level) ?? '—'}</td>
                <td className={`hidden max-w-xs truncate py-3 md:table-cell ${SECONDARY_CLASS}`}>
                  {row.description.trim() || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={STUDIO_FLOAT_IN_STYLE} className="space-y-8 py-2">
      {groupByCategory(rows).map((group) => (
        <section key={group.category} aria-label={group.category}>
          <p className="mb-3 flex items-baseline gap-2">
            <span className="text-[15px] font-semibold text-[#111111] dark:text-neutral-200">{group.category}</span>
            <span className={SECONDARY_CLASS}>{String(group.rows.length).padStart(2, '0')}</span>
          </p>
          <ul className="flex flex-wrap gap-2">
            {group.rows.map((row) => (
              <li key={row.key}>
                <button
                  type="button"
                  aria-label={`Edit ${displayName(row)}`}
                  onClick={() => onOpen(row.key)}
                  className={`inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-4 ${TILE_CLASS}`}
                >
                  <CreatorToolLogo label={displayName(row)} iconUrl={row.iconUrl} size={22} colorMode={colorMode} />
                  <span className="text-[14px] text-[#111111] dark:text-neutral-100">{displayName(row)}</span>
                  {row.level ? <span className={SECONDARY_CLASS}>{levelLabel(row.level)}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function SkillList({
  variant,
  getDraft,
  change,
}: {
  variant: PortfolioSkillVariant;
  getDraft: () => SkillDraft;
  change: StudioChangeHandler<SkillDraft>;
}) {
  const [rows, setRows] = useState(() => getDraft().items);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [view, setView] = useState<SkillView>('list');
  const colorMode = useColorMode();
  const changeView = (next: SkillView) => {
    setFreshKey(null);
    setView(next);
  };

  const openInList = (key: string) => {
    setFreshKey(key);
    setView('list');
  };

  const commitRows = useCallback(
    (next: SkillRow[]) => {
      setRows(next);
      change('items', next);
    },
    [change]
  );

  const updateRow = useCallback<RowChangeHandler>(
    (key, patch) => commitRows(getDraft().items.map((row) => (row.key === key ? { ...row, ...patch } : row))),
    [commitRows, getDraft]
  );

  const removeRow = useCallback(
    (key: string) => commitRows(getDraft().items.filter((row) => row.key !== key)),
    [commitRows, getDraft]
  );

  const add = () => {
    if (rows.length >= MAX_ITEMS) return;
    const row = emptyRow();
    setFreshKey(row.key);
    setView('list');
    commitRows([...rows, row]);
  };

  const label = variant === 'stack' ? 'Stack' : 'Tools';

  return (
    <section className={STUDIO_BLOCK_CLASS} aria-label={label}>
      <div className="min-w-0">
        <StudioSectionHeader label={`${label} · ${String(rows.length).padStart(2, '0')}`}>
          {rows.length > 0 ? <SkillViewSwitch value={view} views={SKILL_VIEWS} onChange={changeView} /> : null}
          <StudioIconAction
            icon="add"
            label={variant === 'stack' ? 'Add technology' : 'Add tool'}
            onClick={add}
            disabled={rows.length >= MAX_ITEMS}
          />
        </StudioSectionHeader>
        {rows.length === 0 ? (
          <button type="button" onClick={add} className={`py-8 ${EMPTY_CLASS} transition-colors hover:text-[#FF5722]`}>
            {variant === 'stack' ? 'No technology yet — add your first one.' : 'No tool yet — add your first one.'}
          </button>
        ) : view === 'list' ? (
          <ul style={STUDIO_FLOAT_IN_STYLE}>
            {rows.map((row) => (
              <SkillRowView
                key={row.key}
                row={row}
                variant={variant}
                autoFocus={row.key === freshKey}
                colorMode={colorMode}
                onChange={updateRow}
                onRemove={removeRow}
              />
            ))}
          </ul>
        ) : (
          <SkillOverview view={view} rows={rows} variant={variant} colorMode={colorMode} onOpen={openInList} />
        )}
      </div>
    </section>
  );
}

export function PortfolioSkillStudio({
  variant,
  items,
  onSave,
}: {
  variant: PortfolioSkillVariant;
  items: PortfolioStrengthDraft[];
  onSave: (next: PortfolioStrengthDraft[]) => Promise<void>;
}) {
  const [initial] = useState<SkillDraft>(() => ({
    items: items.filter((item) => item.value.trim()).map((item) => ({ ...item, key: nextRowKey() })),
  }));

  const signature = useCallback(
    (_key: keyof SkillDraft, value: SkillDraft[keyof SkillDraft]) => JSON.stringify(cleanRows(value)),
    []
  );
  const save = useCallback((draft: SkillDraft) => onSave(cleanRows(draft.items)), [onSave]);

  const studio = useInlineStudio({ initial, onSave: save, signature });

  return (
    <>
      <SkillList key={studio.revision} variant={variant} getDraft={studio.getDraft} change={studio.change} />
      <StudioSaveChrome studio={studio} />
    </>
  );
}
