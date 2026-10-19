'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiErrorMessage } from '@/lib/api-error';
import { listMyContent } from '@/lib/creator-content-api';
import { CreatorContentPublishModal } from '@/components/creator/CreatorContentPublishModal';
import { CreatorContentPostCard } from '@/components/creator/studio/CreatorContentPostCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { NewsPublishButton, RailGlyph } from '@/components/home/NewsDiscoverRail';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { creatorStudioContentHeadline, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { CreatorStudioContentPostsSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import type { ContentPostBucket, CreatorContentItemDto } from '@/types/creator-content';
import { useAuth } from '@/context/AuthContext';
import { STUDIO_PRIMARY_BUTTON, StudioEmptyBlock } from './studio-list-ui';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

const BUCKETS: { id: ContentPostBucket; label: string; empty: string; hint: string }[] = [
  { id: 'active', label: msg('Published'), empty: 'No posts yet', hint: msg('Share a project or a work update — it shows on your profile and in News.') },
  { id: 'pinned', label: msg('Pinned'), empty: 'No pinned posts', hint: msg('Pin a post from its menu to keep it at the top of your profile.') },
  { id: 'archived', label: msg('Archived'), empty: 'No archived posts', hint: msg('Archived posts are hidden from the feed and kept here.') },
  { id: 'trash', label: msg('Trash'), empty: 'Trash is empty', hint: msg('Posts you move to the trash can be restored from here.') },
];

/** Each status as a stroke glyph (RailGlyph), for the icon bar from xl. */
const BUCKET_ICONS: Record<ContentPostBucket, ReactNode> = {
  /* A page of text: what is live. */
  active: (
    <>
      <rect x="4.5" y="3" width="15" height="18" rx="2" />
      <path d="M8.5 8h7" />
      <path d="M8.5 12h7" />
      <path d="M8.5 16h4" />
    </>
  ),
  /* A pushpin. */
  pinned: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v5.5L7 12v2h10v-2l-3-3.5V3" />
      <path d="M12 14v7" />
    </>
  ),
  /* An archive box. */
  archived: (
    <>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </>
  ),
  /* A bin. */
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
      <path d="m6 7 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </>
  ),
};

/**
 * From xl, the status filter as the News feed's quick bar: 40px round icon buttons stacked in the
 * gutter left of the posts, sticky under the navbar. The open status holds the fill tone with a
 * heavier glyph; every button names itself (tooltip + aria-label).
 *
 * From 2xl the gutter is the 160px left of the posts column, and the bar uses its first 128px: each button becomes a 40px
 * row — icon, then its label in 15px — with no fill and no marker: the open status is the one in
 * bold ink with a heavier glyph, the others sit in secondary ink until hovered. An editorial index
 * rather than a pill menu.
 */
function BucketBar({ bucket, onSelect }: { bucket: ContentPostBucket; onSelect: (bucket: ContentPostBucket) => void }) {
  const t = useT();
  return (
    <ProfileSectionStickyAside className="w-10 2xl:w-32" surfaceClassName="flex w-full flex-col gap-2">
      <div
        role="tablist"
        aria-label={t('Content status')}
        aria-orientation="vertical"
        className="flex flex-col items-center gap-2 2xl:items-stretch 2xl:gap-1"
      >
        {BUCKETS.map((entry) => {
          const active = bucket === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={t(entry.label)}
              title={t(entry.label)}
              onClick={() => onSelect(entry.id)}
              className={`group/bucket relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] 2xl:w-full 2xl:justify-start 2xl:gap-3 2xl:rounded-none 2xl:bg-transparent 2xl:pl-0 2xl:hover:bg-transparent ${
                active
                  ? 'bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
                  : '2xl:text-[color:var(--gn-ink2)] 2xl:hover:text-[color:var(--gn-ink)]'
              }`}
            >
              <RailGlyph active={active}>{BUCKET_ICONS[entry.id]}</RailGlyph>
              <span
                aria-hidden
                className={`hidden truncate text-[15px] leading-5 2xl:inline ${active ? 'font-bold' : 'font-normal'}`}
              >
                {t(entry.label)}
              </span>
            </button>
          );
        })}
      </div>
    </ProfileSectionStickyAside>
  );
}

type CreatorStudioContentTabProps = {
  specialite?: string | null;
  specialties?: string[] | null;
  appRole?: string | null;
  /** Controlled publish modal state. */
  publishOpen?: boolean;
  onPublishOpenChange?: (open: boolean) => void;
};

export function CreatorStudioContentTab({
  specialite,
  specialties,
  appRole,
  publishOpen: controlledPublishOpen,
  onPublishOpenChange,
}: CreatorStudioContentTabProps) {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [items, setItems] = useState<CreatorContentItemDto[]>([]);
  const [bucket, setBucket] = useState<ContentPostBucket>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localPublishOpen, setLocalPublishOpen] = useState(false);
  const publishOpen = controlledPublishOpen ?? localPublishOpen;
  const setPublishOpen = useCallback(
    (open: boolean) => {
      if (onPublishOpenChange) onPublishOpenChange(open);
      else setLocalPublishOpen(open);
    },
    [onPublishOpenChange]
  );
  const load = useCallback(async (selectedBucket: ContentPostBucket, silent = false) => {
    try {
      setError(null);
      if (!silent) setLoading(true);
      const list = await listMyContent(selectedBucket);
      setItems(list.content);
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to load your content.')));
      if (!silent) {
        setItems([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load(bucket);
  }, [bucket, load]);

  useEffect(() => {
    if (searchParams.get('publish') === '1') {
      setPublishOpen(true);
      router.replace('/profile?tab=content', { scroll: false });
    }
  }, [router, searchParams, setPublishOpen]);

  const showComposer = bucket === 'active';
  const emptyEntry = BUCKETS.find((b) => b.id === bucket);

  /* The posts column (at most 640px) is centred in the content area. From xl the area has a gutter
     of 72px or more on each side, and the status bar (BucketBar) sits in the left one, its edge on
     the area's — the text tabs give way to it.
     From 2xl the area is its full 872px (1240 frame − 320 rail − 48 gap): the column starts 160px in
     (the 128px status bar + a 32px gap) and runs 712px to the area's right edge, so it still ends with
     the profile header's bio column (CreatorProfileHeader) but gives the cards more room. */
  return (
    <div className="relative w-full">
      <div className="absolute left-0 top-0 hidden h-full xl:block">
        <BucketBar bucket={bucket} onSelect={setBucket} />
      </div>
      <div className="mx-auto w-full max-w-[640px] 2xl:ml-[160px] 2xl:mr-0 2xl:max-w-[712px]">
        <CreatorContentPublishModal
          open={publishOpen}
          onClose={() => setPublishOpen(false)}
          onPublished={() => void load(bucket)}
          appRole={appRole}
        />

        <div className="px-4 sm:px-0">
          {/* Named after the selected "Manage" entry so the rail visibly drives this column; the role's
              pitch line drops to a quiet subtitle instead of competing with the posts. */}
          {/* Phones: the active tab already says "Content", so the title block is dropped there. */}
          <h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)] max-sm:hidden">
            {t('Content')}
            {/* On xl the bar shows bare icons, so the title names the open status; from 2xl the bar carries its labels and the title drops it. */}
            <span className="hidden font-semibold text-[color:var(--gn-ink2)] xl:inline 2xl:hidden"> · {t(emptyEntry?.label)}</span>
          </h2>
          <p className="mt-0.5 text-[14px] leading-5 text-[color:var(--gn-ink2)] max-sm:hidden">
            {creatorStudioContentHeadline(normalizeCreatorAppRole(appRole))}
          </p>

          {/* Status filter: plain text tabs, no pills — the navbar's own idiom ("News" in the top bar):
              the open one in ink with a 2px ink bar under it, the others secondary ink until hovered. */}
          <div
            role="tablist"
            aria-label={t('Content status')}
            className="-mx-4 flex gap-6 overflow-x-auto sm:mt-4 px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 xl:hidden [&::-webkit-scrollbar]:hidden"
          >
            {BUCKETS.map((entry) => {
              const active = bucket === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setBucket(entry.id)}
                  data-pf-no-color-transition
                  className={`relative inline-flex h-10 shrink-0 items-center text-[15px] leading-5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
                    active
                      ? 'font-bold text-[color:var(--gn-ink)]'
                      : 'font-medium text-[color:var(--gn-ink2)] hover:text-[color:var(--gn-ink)]'
                  }`}
                >
                  {t(entry.label)}
                  {active ? (
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[color:var(--gn-ink)]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="mt-4 px-4 sm:px-0">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:gap-5">
          {/* Writing a post: one "Publish a post" button, as on News. From lg it sits under the Manage rail
              (CreatorStudioShell `railFooter`); below lg — no rail — it heads the Published view only. */}
          {showComposer ? (
            <div className="hidden sm:block lg:hidden">
              <NewsPublishButton canPublish onCompose={() => setPublishOpen(true)} />
            </div>
          ) : null}
          {loading ? (
            <CreatorStudioContentPostsSkeleton />
          ) : items.length === 0 ? (
            <StudioEmptyBlock
              bleed={false}
              title={emptyEntry?.empty ?? t('Nothing here yet.')}
              action={
                bucket === 'active' ? (
                  <button type="button" onClick={() => setPublishOpen(true)} className={STUDIO_PRIMARY_BUTTON}>
                    {t('Publish your first post')}
                  </button>
                ) : undefined
              }
            >
              {t(emptyEntry?.hint)}
            </StudioEmptyBlock>
          ) : (
            items.map((post) => (
              <CreatorContentPostCard
                key={post.id}
                post={post}
                bucket={bucket}
                creatorName={user?.fullName ?? 'You'}
                specialite={specialite}
                specialties={specialties}
                onChanged={() => void load(bucket, true)}
                onError={setError}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
