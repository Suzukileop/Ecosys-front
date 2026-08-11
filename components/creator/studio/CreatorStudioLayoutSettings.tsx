'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CreatorStudioHeaderLayoutPicker } from '@/components/creator/studio/CreatorStudioHeaderLayoutPicker';
import { LayoutSettingsExploreModal } from '@/components/creator/studio/LayoutSettingsExploreModal';
import {
  CREATOR_STUDIO_TAB_NAV_ALIGN_OPTIONS,
  type CreatorStudioTabNavAlign,
} from '@/components/creator/studio/creator-studio-layout';
import {
  CREATOR_STUDIO_HEADER_LAYOUTS,
  type CreatorStudioHeaderLayout,
} from '@/components/creator/studio/creator-studio-header';
import {
  CREATOR_STUDIO_HEADER_CONTENT_STYLES,
  headerLayoutSupportsContentStyle,
  type CreatorStudioHeaderContentStyle,
} from '@/components/creator/studio/creator-studio-header-content';
import {
  DEFAULT_STUDIO_CONTENT_HEADLINE,
  resolveStudioContentHeadline,
} from '@/components/creator/studio/studio-content-headline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LayoutOptionCard } from '@/components/creator/studio/LayoutOptionCard';

const HEADER_COMPACT_DEFAULTS: CreatorStudioHeaderLayout[] = ['BANNER', 'SPLIT'];
const CONTENT_HEADLINE_MAX = 160;

const TAB_ALIGN_LABELS: Record<CreatorStudioTabNavAlign, string> = {
  LEFT: 'Left',
  CENTER: 'Center',
  RIGHT: 'Right',
};

function getCompactHeaderLayouts(value: CreatorStudioHeaderLayout): CreatorStudioHeaderLayout[] {
  if (HEADER_COMPACT_DEFAULTS.includes(value)) return HEADER_COMPACT_DEFAULTS;
  return [value, HEADER_COMPACT_DEFAULTS[0]];
}

type CreatorStudioLayoutSettingsProps = {
  headerLayout: CreatorStudioHeaderLayout;
  headerContentStyle: CreatorStudioHeaderContentStyle;
  tabNavAlign: CreatorStudioTabNavAlign;
  contentHeadline?: string | null;
  savingHeader?: boolean;
  savingHeaderContent?: boolean;
  savingTabAlign?: boolean;
  savingContentHeadline?: boolean;
  onHeaderLayoutChange: (layout: CreatorStudioHeaderLayout) => void | Promise<void>;
  onHeaderContentStyleChange: (style: CreatorStudioHeaderContentStyle) => void | Promise<void>;
  onTabNavAlignChange: (align: CreatorStudioTabNavAlign) => void | Promise<void>;
  onContentHeadlineChange: (headline: string) => void | Promise<void>;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
      {children}
    </h3>
  );
}

function TabNavAlignPreview({ align }: { align: CreatorStudioTabNavAlign }) {
  const barClass =
    align === 'CENTER' ? 'justify-center' : align === 'RIGHT' ? 'justify-end' : 'justify-start';

  return (
    <div className="flex min-h-[2.75rem] items-center rounded-md border border-neutral-200/80 bg-neutral-100/80 px-3 dark:border-neutral-700/80 dark:bg-neutral-950/80">
      <div className={`flex w-full gap-1.5 ${barClass}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full ${i === 0 ? 'w-8 bg-neutral-400 dark:bg-neutral-500' : 'w-5 bg-neutral-300/80 dark:bg-neutral-700'}`}
          />
        ))}
      </div>
    </div>
  );
}

function TabNavAlignPicker({
  value,
  saving = false,
  onChange,
}: {
  value: CreatorStudioTabNavAlign;
  saving?: boolean;
  onChange: (align: CreatorStudioTabNavAlign) => void | Promise<void>;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CREATOR_STUDIO_TAB_NAV_ALIGN_OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <LayoutOptionCard
            key={option.id}
            selected={selected}
            disabled={saving}
            onClick={() => void onChange(option.id)}
            className={!selected ? 'opacity-60' : undefined}
          >
            <TabNavAlignPreview align={option.id} />
            <div className="mt-2 flex items-center justify-between gap-1">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {TAB_ALIGN_LABELS[option.id]}
              </p>
              {selected && saving ? <LoadingSpinner size="sm" /> : null}
            </div>
          </LayoutOptionCard>
        );
      })}
    </div>
  );
}

function HeaderContentStylePicker({
  value,
  saving = false,
  onChange,
}: {
  value: CreatorStudioHeaderContentStyle;
  saving?: boolean;
  onChange: (style: CreatorStudioHeaderContentStyle) => void | Promise<void>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CREATOR_STUDIO_HEADER_CONTENT_STYLES.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={saving}
            onClick={() => void onChange(option.id)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition disabled:opacity-60 ${
              selected
                ? 'border-orange-400/45 bg-neutral-50/50 text-orange-600 dark:border-orange-400/35 dark:bg-neutral-900/50 dark:text-orange-300'
                : 'border-neutral-200/80 bg-neutral-50/50 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ContentHeadlineEditor({
  value,
  saving = false,
  onSave,
}: {
  value?: string | null;
  saving?: boolean;
  onSave: (headline: string) => void | Promise<void>;
}) {
  const resolved = resolveStudioContentHeadline(value);
  const [draft, setDraft] = useState(resolved);

  useEffect(() => {
    setDraft(resolveStudioContentHeadline(value));
  }, [value]);

  const dirty = draft.trim() !== resolved.trim();
  const tooLong = draft.trim().length > CONTENT_HEADLINE_MAX;

  return (
    <div className="space-y-2">
      <label htmlFor="studio-content-headline" className="sr-only">
        Content tab headline
      </label>
      <textarea
        id="studio-content-headline"
        value={draft}
        disabled={saving}
        rows={2}
        maxLength={CONTENT_HEADLINE_MAX}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={DEFAULT_STUDIO_CONTENT_HEADLINE}
        className="w-full resize-none rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 text-sm font-medium leading-snug text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/20 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950/60 dark:text-white dark:placeholder:text-neutral-500"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          Shown above “Publish content” on the Content tab.
          <span className="ml-2 tabular-nums">
            {draft.trim().length}/{CONTENT_HEADLINE_MAX}
          </span>
        </p>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              disabled={saving}
              onClick={() => setDraft(resolved)}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            disabled={saving || !dirty || tooLong}
            onClick={() => void onSave(draft.trim() || DEFAULT_STUDIO_CONTENT_HEADLINE)}
            className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? <LoadingSpinner size="sm" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ExploreButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-200/80 px-2.5 py-1 text-[11px] font-semibold text-neutral-500 transition hover:border-orange-300/50 hover:text-orange-500 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-orange-400/30 dark:hover:text-orange-400"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {label}
    </button>
  );
}

export function CreatorStudioLayoutSettings({
  headerLayout,
  headerContentStyle,
  tabNavAlign,
  contentHeadline,
  savingHeader = false,
  savingHeaderContent = false,
  savingTabAlign = false,
  savingContentHeadline = false,
  onHeaderLayoutChange,
  onHeaderContentStyleChange,
  onTabNavAlignChange,
  onContentHeadlineChange,
}: CreatorStudioLayoutSettingsProps) {
  const [headerModalOpen, setHeaderModalOpen] = useState(false);

  const compactHeaderLayouts = getCompactHeaderLayouts(headerLayout);
  const hasMoreHeaderLayouts = CREATOR_STUDIO_HEADER_LAYOUTS.length > HEADER_COMPACT_DEFAULTS.length;

  const handleHeaderChange = async (layout: CreatorStudioHeaderLayout) => {
    await onHeaderLayoutChange(layout);
    setHeaderModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Profile header</SectionLabel>
          {hasMoreHeaderLayouts ? (
            <ExploreButton onClick={() => setHeaderModalOpen(true)} label="Explore" />
          ) : null}
        </div>
        <CreatorStudioHeaderLayoutPicker
          value={headerLayout}
          saving={savingHeader}
          layoutIds={compactHeaderLayouts}
          variant="row"
          onChange={onHeaderLayoutChange}
        />
        {headerLayoutSupportsContentStyle(headerLayout) ? (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Content display</p>
            <HeaderContentStylePicker
              value={headerContentStyle}
              saving={savingHeaderContent}
              onChange={onHeaderContentStyleChange}
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-2">
        <SectionLabel>Tab navigation</SectionLabel>
        <TabNavAlignPicker
          value={tabNavAlign}
          saving={savingTabAlign}
          onChange={onTabNavAlignChange}
        />
      </section>

      <section className="space-y-2">
        <SectionLabel>Content tab headline</SectionLabel>
        <ContentHeadlineEditor
          value={contentHeadline}
          saving={savingContentHeadline}
          onSave={onContentHeadlineChange}
        />
      </section>

      <LayoutSettingsExploreModal
        open={headerModalOpen}
        onClose={() => setHeaderModalOpen(false)}
        title="All profile header styles"
        description="Browse every header layout available for your creator profile."
      >
        <CreatorStudioHeaderLayoutPicker
          value={headerLayout}
          saving={savingHeader}
          onChange={handleHeaderChange}
          className="grid gap-3 sm:grid-cols-2"
        />
      </LayoutSettingsExploreModal>
    </div>
  );
}
