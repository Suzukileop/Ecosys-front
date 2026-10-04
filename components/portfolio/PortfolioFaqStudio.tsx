'use client';

import { memo, useCallback, useState } from 'react';
import { UserFacingError } from '@/lib/api-error';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { MAX_FAQ } from '@/components/creator/studio/ProfileFaqField';
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

type FaqItem = { question: string; answer: string };
type FaqRow = FaqItem & { key: string };
type FaqDraft = { items: FaqRow[] };
type RowChangeHandler = (key: string, patch: Partial<FaqItem>) => void;

const MAX_QUESTION = 200;
const MAX_ANSWER = 1000;

let rowSeq = 0;
const nextRowKey = () => `faq-${++rowSeq}`;

function cleanItems(rows: FaqRow[]): FaqItem[] {
  return rows
    .map((row) => ({ question: row.question.trim(), answer: row.answer.trim() }))
    .filter((row) => row.question || row.answer);
}

function faqSignature(_key: keyof FaqDraft, value: FaqDraft[keyof FaqDraft]): string {
  return JSON.stringify(cleanItems(value));
}

const MOVE_BUTTON_CLASS =
  'inline-flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-black/[0.05] hover:text-black disabled:pointer-events-none disabled:opacity-0 dark:text-neutral-500 dark:hover:bg-white/[0.08] dark:hover:text-white';

const FaqRowView = memo(function FaqRowView({
  row,
  index,
  total,
  autoFocus,
  onChange,
  onMove,
  onRemove,
}: {
  row: FaqRow;
  index: number;
  total: number;
  autoFocus: boolean;
  onChange: RowChangeHandler;
  onMove: (key: string, direction: -1 | 1) => void;
  onRemove: (key: string) => void;
}) {
  const missingAnswer = Boolean(row.question.trim()) && !row.answer.trim();

  return (
    <li className={`group/row grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-x-3 py-8 first:pt-2 ${STUDIO_ROW_RULE}`}>
      <span aria-hidden className="pt-0.5 text-[15px] font-semibold tabular-nums text-[#FF5722]">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="min-w-0">
        <StudioUnderline quiet>
          <input
            type="text"
            value={row.question}
            maxLength={MAX_QUESTION}
            placeholder="Ask a question buyers often have"
            aria-label={`Question ${index + 1}`}
            autoFocus={autoFocus}
            autoComplete="off"
            onChange={(event) => onChange(row.key, { question: event.currentTarget.value })}
            className={`${STUDIO_BARE_INPUT_CLASS} text-base font-semibold text-black dark:text-neutral-100`}
          />
        </StudioUnderline>
        <StudioUnderline quiet className="mt-3">
          <textarea
            value={row.answer}
            maxLength={MAX_ANSWER}
            rows={1}
            placeholder="Answer in one or two sentences"
            aria-label={`Answer ${index + 1}`}
            onChange={(event) => onChange(row.key, { answer: event.currentTarget.value })}
            className={`${STUDIO_BARE_INPUT_CLASS} resize-none text-[15px] leading-relaxed text-neutral-600 [field-sizing:content] dark:text-neutral-300`}
          />
        </StudioUnderline>
        {missingAnswer ? (
          <p className="mt-1 text-[13px] text-neutral-400 dark:text-neutral-500">An answer is required.</p>
        ) : null}
      </div>

      <div className="-mt-1 flex items-start gap-0.5">
        <div className="flex opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100">
          <button
            type="button"
            aria-label={`Move question ${index + 1} up`}
            title="Move up"
            disabled={index === 0}
            onClick={() => onMove(row.key, -1)}
            className={MOVE_BUTTON_CLASS}
          >
            <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label={`Move question ${index + 1} down`}
            title="Move down"
            disabled={index >= total - 1}
            onClick={() => onMove(row.key, 1)}
            className={MOVE_BUTTON_CLASS}
          >
            <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
          </button>
        </div>
        <StudioRemoveButton label={`Remove question ${index + 1}`} onClick={() => onRemove(row.key)} />
      </div>
    </li>
  );
});

function FaqList({ getDraft, change }: { getDraft: () => FaqDraft; change: StudioChangeHandler<FaqDraft> }) {
  const [rows, setRows] = useState(() => getDraft().items);
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const commitRows = useCallback(
    (next: FaqRow[]) => {
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
    if (rows.length >= MAX_FAQ) return;
    const row: FaqRow = { key: nextRowKey(), question: '', answer: '' };
    setFreshKey(row.key);
    commitRows([...rows, row]);
  };

  return (
    <section className="pb-10 pt-3" aria-label="FAQ">
      <StudioSectionHeader label={`Questions · ${String(rows.length).padStart(2, '0')}`}>
        <span className={STUDIO_SECONDARY_CLASS}>
          {rows.length} of {MAX_FAQ}
        </span>
        <StudioIconAction icon="add" label="Add question" onClick={add} disabled={rows.length >= MAX_FAQ} />
      </StudioSectionHeader>

      {rows.length === 0 ? (
        <button type="button" onClick={add} className={`py-8 ${STUDIO_EMPTY_CLASS} transition-colors hover:text-[#FF5722]`}>
          No question yet — add the first one buyers usually ask.
        </button>
      ) : (
        <ul style={STUDIO_FLOAT_IN_STYLE}>
          {rows.map((row, index) => (
            <FaqRowView
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

/** FAQ edited inline: numbered question/answer rows, saved through the floating bar. */
export function PortfolioFaqStudio({
  items,
  onSave,
}: {
  items: FaqItem[];
  onSave: (next: FaqItem[]) => Promise<void>;
}) {
  const [initial] = useState<FaqDraft>(() => ({
    items: items
      .filter((item) => item.question.trim() || item.answer.trim())
      .slice(0, MAX_FAQ)
      .map((item) => ({ ...item, key: nextRowKey() })),
  }));

  const save = useCallback(
    async (draft: FaqDraft) => {
      const cleaned = cleanItems(draft.items);
      if (cleaned.some((item) => !item.question || !item.answer)) {
        throw new UserFacingError('Each question needs an answer.');
      }
      await onSave(cleaned);
    },
    [onSave]
  );

  const studio = useInlineStudio({ initial, onSave: save, signature: faqSignature });

  return (
    <>
      <FaqList key={studio.revision} getDraft={studio.getDraft} change={studio.change} />
      <StudioSaveChrome studio={studio} />
    </>
  );
}
