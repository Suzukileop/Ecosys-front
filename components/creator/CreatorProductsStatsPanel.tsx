'use client';

import { useMemo, useState } from 'react';
import { CreatorStoreSettingsModal } from '@/components/creator/CreatorStoreSettingsModal';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceProductGroup } from '@/types/marketplace';

const SIDEBAR_GROUPS_LIMIT = 8;

type CreatorProductsStatsPanelProps = {
  groups?: MarketplaceProductGroup[];
  selectedGroupId?: string | null;
  exploring?: boolean;
  /** Public shop: hide + New and Settings. */
  readOnly?: boolean;
  onSelectGroup?: (groupId: string | null) => void;
  onCreateGroup?: () => void;
  onExplore?: () => void;
};

export function CreatorProductsStatsPanel({
  groups = [],
  selectedGroupId = null,
  exploring = false,
  readOnly = false,
  onSelectGroup,
  onCreateGroup,
  onExplore,
}: CreatorProductsStatsPanelProps) {
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const storefrontHref = user?.id ? `/marketplace/${user.id}` : '/dashboard/portfolio';

  const visibleGroups = useMemo(() => groups.slice(0, SIDEBAR_GROUPS_LIMIT), [groups]);
  const hasMoreGroups = groups.length > SIDEBAR_GROUPS_LIMIT;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Catalogues
          </p>
          {!readOnly && onCreateGroup ? (
            <button
              type="button"
              onClick={onCreateGroup}
              className="text-xs font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              + New
            </button>
          ) : null}
        </div>

        {groups.length === 0 ? (
          <p className="px-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {readOnly ? 'No catalogues yet.' : 'No catalogues yet. Create one to organize products.'}
          </p>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-[#0F0F0F]">
            <div className="flex flex-col gap-1" role="list" aria-label="Product catalogues">
              {visibleGroups.map((group) => {
                const selected = selectedGroupId === group.id && !exploring;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => onSelectGroup?.(selected ? null : group.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                      selected
                        ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white'
                        : 'bg-transparent text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-900'
                    }`}
                  >
                    <span className="truncate text-sm font-semibold">{group.name}</span>
                    <span className="ml-2 shrink-0 text-xs font-medium tabular-nums text-neutral-500 dark:text-neutral-400">
                      {group.productCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {onExplore ? (
              <button
                type="button"
                onClick={onExplore}
                aria-pressed={exploring}
                className={`mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  exploring
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <span>Explore</span>
                {hasMoreGroups ? (
                  <span className="text-xs font-medium tabular-nums text-neutral-500 dark:text-neutral-400">
                    ({groups.length})
                  </span>
                ) : null}
                <svg
                  className={`h-4 w-4 shrink-0 ${exploring ? 'text-white/70 dark:text-neutral-500' : 'text-neutral-500 dark:text-neutral-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {!readOnly ? (
        <>
          <hr className="border-neutral-200 dark:border-neutral-700" />

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 01-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>

          <CreatorStoreSettingsModal
            open={settingsOpen}
            storefrontHref={storefrontHref}
            onClose={() => setSettingsOpen(false)}
          />
        </>
      ) : null}
    </div>
  );
}
