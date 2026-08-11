'use client';

import { useEffect, useRef, useState } from 'react';
import { ContentCategorySelect } from '@/components/creator/ContentCategorySelect';
import type { ContentPostBucket, CreatorContentItemDto } from '@/types/creator-content';

type ContentPostDetailsBlockProps = {
  post: ContentPostDetailsPost;
  bucket?: ContentPostBucket;
  variant?: 'inline' | 'sidebar';
  hideTitle?: boolean;
  /** Studio owner editing texts in place (media never editable here). */
  editing?: boolean;
  draft?: ContentDetailsDraft;
  onDraftChange?: (next: ContentDetailsDraft) => void;
  disabled?: boolean;
};

export type ContentPostDetailsPost = Pick<
  CreatorContentItemDto,
  'title' | 'description' | 'tags' | 'toolsUsed' | 'textColor' | 'genre' | 'priceInfo'
>;

export type ContentDetailsDraft = {
  title: string;
  genre: string;
  description: string;
  priceInfo: string;
  tags: string[];
  toolsUsed: string[];
};

export function toContentDetailsDraft(post: ContentPostDetailsPost): ContentDetailsDraft {
  return {
    title: post.title ?? '',
    genre: post.genre ?? '',
    description: post.description ?? '',
    priceInfo: post.priceInfo ?? '',
    tags: [...(post.tags ?? [])],
    toolsUsed: [...(post.toolsUsed ?? [])],
  };
}

/** Split "500 Ar", "1 200.50 AR", or plain amounts for styled currency. */
function splitPriceLabel(priceInfo: string): { amount: string; currency: string | null } {
  const raw = priceInfo.trim();
  if (!raw) return { amount: '—', currency: null };

  const match = raw.match(/^(.+?)\s*(Ar|AR|MGA|€|\$|USD|EUR)$/i);
  if (!match) return { amount: raw, currency: null };

  const amount = match[1].trim();
  if (!amount) return { amount: raw, currency: null };

  const token = match[2];
  let currency = token;
  if (/^ar$/i.test(token)) currency = 'Ar';
  else if (/^mga$/i.test(token)) currency = 'MGA';
  else if (/^usd$/i.test(token)) currency = 'USD';
  else if (/^eur$/i.test(token)) currency = 'EUR';

  return { amount, currency };
}

function needsShowMoreInline(description: string) {
  const singleLine = description.replace(/\s+/g, ' ').trim();
  return singleLine.length > 72 || description.includes('\n');
}

function DescriptionText({
  description,
  descExpanded,
  isSidebar,
  onClampedChange,
}: {
  description: string;
  descExpanded: boolean;
  isSidebar: boolean;
  onClampedChange: (clamped: boolean) => void;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || descExpanded) {
      onClampedChange(false);
      return;
    }

    const measure = () => {
      onClampedChange(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [description, descExpanded, isSidebar, onClampedChange]);

  const displayText = descExpanded ? description : description.replace(/\s*\n+\s*/g, ' ');

  return (
    <p
      ref={ref}
      className={`text-sm text-neutral-500 dark:text-neutral-400 ${
        descExpanded
          ? 'whitespace-pre-wrap leading-relaxed'
          : isSidebar
            ? 'line-clamp-3 leading-relaxed'
            : 'truncate'
      }`}
    >
      {displayText}
    </p>
  );
}

function bucketBadge(bucket?: ContentPostBucket) {
  if (bucket === 'archived') {
    return (
      <span className="rounded-md border border-amber-400/50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
        Archived
      </span>
    );
  }
  if (bucket === 'trash') {
    return (
      <span className="rounded-md border border-red-400/50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
        Trash
      </span>
    );
  }
  return null;
}

const editInputClass =
  'w-full rounded-none border-0 border-b border-neutral-200 bg-transparent px-0 py-1 outline-none transition placeholder:text-neutral-400 focus:border-orange-500 dark:border-neutral-700 dark:placeholder:text-neutral-600 dark:focus:border-orange-400';

export function ContentPostTitle({
  post,
  bucket,
}: Pick<ContentPostDetailsBlockProps, 'post' | 'bucket'>) {
  const title = post.title?.trim() || 'Untitled';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3
        className="text-lg font-bold leading-tight text-neutral-900 dark:text-white"
        style={post.textColor ? { color: post.textColor } : undefined}
      >
        {title}
      </h3>
      {bucketBadge(bucket)}
    </div>
  );
}

function ContentPostPriceEstimate({ priceInfo }: { priceInfo?: string | null }) {
  const priceLabel = priceInfo?.trim() ? priceInfo.trim() : null;
  if (!priceLabel) return null;

  const { amount, currency } = splitPriceLabel(priceLabel);

  return (
    <div>
      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        Estimated amount to recreate this piece…
      </p>
      <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-3xl font-bold tracking-tight text-neutral-950 tabular-nums dark:text-white">
          {amount}
        </span>
        {currency && (
          <span className="text-xl font-bold tracking-wide text-orange-500 dark:text-orange-400">
            {currency}
          </span>
        )}
      </p>
    </div>
  );
}

function EditableStringList({
  values,
  onChange,
  placeholder,
  maxItems = 10,
  prefix,
  itemClassName,
  disabled,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  maxItems?: number;
  prefix?: string;
  itemClassName: string;
  disabled?: boolean;
}) {
  const rows = values.length > 0 ? values : [''];

  const updateAt = (index: number, value: string) => {
    const next = [...rows];
    next[index] = value;
    onChange(next);
  };

  const removeAt = (index: number) => {
    if (rows.length <= 1) {
      onChange(['']);
      return;
    }
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="min-w-0 space-y-2">
      {rows.map((value, index) => (
        <div key={index} className="flex items-center gap-1">
          {prefix && (
            <span className={`shrink-0 ${itemClassName}`} aria-hidden>
              {prefix}
            </span>
          )}
          <input
            type="text"
            value={value}
            disabled={disabled}
            onChange={(e) => updateAt(index, e.target.value)}
            placeholder={placeholder}
            className={`${editInputClass} ${itemClassName} min-w-0 flex-1`}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeAt(index)}
            className="shrink-0 px-1 text-xs text-neutral-400 hover:text-neutral-700 disabled:opacity-40 dark:hover:text-neutral-200"
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}
      {rows.length < maxItems && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([...rows, ''])}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400"
        >
          + Add
        </button>
      )}
    </div>
  );
}

export function ContentPostDetailsBlock({
  post,
  bucket,
  variant = 'inline',
  hideTitle = false,
  editing = false,
  draft,
  onDraftChange,
  disabled = false,
}: ContentPostDetailsBlockProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [descClamped, setDescClamped] = useState(false);
  const isSidebar = variant === 'sidebar';
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editing]);

  if (editing && draft && onDraftChange) {
    return (
      <div className={isSidebar ? 'space-y-6' : 'space-y-4'}>
        {!hideTitle && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={titleInputRef}
              type="text"
              value={draft.title}
              disabled={disabled}
              maxLength={300}
              onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
              placeholder="Post headline"
              className={`${editInputClass} font-bold leading-tight text-neutral-900 dark:text-white ${
                isSidebar ? 'text-xl' : 'text-lg'
              }`}
              style={post.textColor ? { color: post.textColor } : undefined}
            />
            {bucketBadge(bucket)}
          </div>
        )}

        <ContentCategorySelect
          id="content-edit-genre"
          value={draft.genre}
          onChange={(next) => onDraftChange({ ...draft, genre: next })}
          disabled={disabled}
          labelClass="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
          fieldClass={`${editInputClass} mt-0 text-sm font-medium text-neutral-700 dark:text-neutral-200`}
          placeholder="Branding, Motion, Tech…"
        />

        <textarea
          value={draft.description}
          disabled={disabled}
          maxLength={2000}
          rows={4}
          onChange={(e) => onDraftChange({ ...draft, description: e.target.value })}
          placeholder="Description"
          className={`${editInputClass} resize-y text-sm leading-relaxed text-neutral-500 dark:text-neutral-400`}
        />

        {isSidebar && (
          <div>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Estimated amount to recreate this piece…
            </p>
            <input
              type="text"
              value={draft.priceInfo}
              disabled={disabled}
              maxLength={200}
              onChange={(e) => onDraftChange({ ...draft, priceInfo: e.target.value })}
              placeholder="e.g. 500 Ar"
              className={`${editInputClass} mt-2.5 text-2xl font-bold tracking-tight text-neutral-950 tabular-nums dark:text-white`}
            />
          </div>
        )}

        <div
          className={
            isSidebar
              ? 'mt-6 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-neutral-800/40 pt-6 dark:border-neutral-200/20'
              : 'mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-neutral-800/40 pt-4 dark:border-neutral-200/20'
          }
        >
          <EditableStringList
            values={draft.tags}
            onChange={(tags) => onDraftChange({ ...draft, tags })}
            placeholder="tag"
            prefix="#"
            disabled={disabled}
            itemClassName={`font-medium text-sky-600 dark:text-sky-400 ${isSidebar ? 'text-sm' : 'text-xs'}`}
          />
          <EditableStringList
            values={draft.toolsUsed}
            onChange={(toolsUsed) => onDraftChange({ ...draft, toolsUsed })}
            placeholder="Tool"
            disabled={disabled}
            itemClassName={`font-medium text-neutral-700 dark:text-neutral-200 ${isSidebar ? 'text-sm' : 'text-xs'}`}
          />
        </div>
      </div>
    );
  }

  const title = post.title?.trim() || 'Untitled';
  const genre = post.genre?.trim() ?? '';
  const description = post.description?.trim() ?? '';
  const tags = (post.tags ?? []).filter(Boolean);
  const tools = (post.toolsUsed ?? []).filter(Boolean);
  const hasPrice = Boolean(post.priceInfo?.trim());
  const hasMetaGrid = tags.length > 0 || tools.length > 0;
  const showMoreInline = needsShowMoreInline(description);
  const showToggle = isSidebar ? descClamped || descExpanded : showMoreInline || descExpanded;

  return (
    <div>
      <div className={isSidebar ? 'space-y-6' : 'space-y-4'}>
        {!hideTitle && (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`font-bold leading-tight text-neutral-900 dark:text-white ${
                  isSidebar ? 'text-xl' : 'text-lg'
                }`}
                style={post.textColor ? { color: post.textColor } : undefined}
              >
                {title}
              </h3>
              {bucketBadge(bucket)}
            </div>
            {genre && (
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                {genre}
              </p>
            )}
          </div>
        )}

        {description && (
          <div>
            <DescriptionText
              description={description}
              descExpanded={descExpanded}
              isSidebar={isSidebar}
              onClampedChange={setDescClamped}
            />
            {showToggle && (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                {descExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {isSidebar && hasPrice && <ContentPostPriceEstimate priceInfo={post.priceInfo} />}
      </div>

      {hasMetaGrid && (
        <div
          className={
            isSidebar
              ? 'mt-6 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-neutral-800/40 pt-6 dark:border-neutral-200/20'
              : 'mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-neutral-800/40 pt-4 dark:border-neutral-200/20'
          }
        >
          {tags.length > 0 && (
            <div className="min-w-0 space-y-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`block font-medium text-sky-600 dark:text-sky-400 ${
                    isSidebar ? 'text-sm' : 'truncate text-xs'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {tools.length > 0 && (
            <div className={`min-w-0 space-y-2 ${tags.length === 0 ? 'col-span-2' : ''}`}>
              {tools.map((tool) => (
                <span
                  key={tool}
                  className={`block font-medium text-neutral-700 dark:text-neutral-200 ${
                    isSidebar ? 'text-sm' : 'truncate text-xs'
                  }`}
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ContentPostCardFooter({
  genre,
  priceInfo,
}: {
  genre?: string | null;
  priceInfo?: string | null;
}) {
  const genreLabel = genre?.trim() ? genre.trim().toUpperCase() : null;
  const priceLabel = priceInfo?.trim() ? priceInfo.trim() : null;
  const parts = [genreLabel, priceLabel].filter(Boolean);

  return (
    <div className="border-t border-neutral-200 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:border-neutral-800">
      {parts.length > 0 ? parts.join(' · ') : 'No genre · No price'}
    </div>
  );
}
