'use client';

import { useMemo, useState } from 'react';
import { CreatorStoreSettingsModal } from '@/components/creator/CreatorStoreSettingsModal';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceProductGroup } from '@/types/marketplace';

const SIDEBAR_GROUPS_LIMIT = 8;

const GEAR_PATHS = [
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 01-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
];

function GearIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      {GEAR_PATHS.map((d) => (
        <path key={d} strokeLinecap="round" strokeLinejoin="round" d={d} />
      ))}
    </svg>
  );
}

/** Compact Store settings trigger for layouts without the side panel (tablet, phone). */
export function CreatorStoreSettingsButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const storefrontHref = user?.id ? `/providers/${user.id}` : '/studio';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Store settings"
        title="Store settings"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.12] text-[#111111] transition-colors hover:border-black/25 dark:border-white/[0.14] dark:text-white dark:hover:border-white/30 sm:h-10 sm:w-10 sm:rounded-lg"
      >
        <GearIcon />
      </button>
      <CreatorStoreSettingsModal open={open} storefrontHref={storefrontHref} onClose={() => setOpen(false)} />
    </>
  );
}

type CreatorProductsCatalogueStripProps = {
  groups: MarketplaceProductGroup[];
  groupCounts?: Record<string, number>;
  selectedGroupId?: string | null;
  exploring?: boolean;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup?: () => void;
  onExplore?: () => void;
  /** Count shown on the leading "All" chip. */
  allCount?: number;
};

/** Catalogues as one swipeable row of chips — the side panel's job on tablet and phone. */
export function CreatorProductsCatalogueStrip({
  groups,
  groupCounts,
  selectedGroupId = null,
  exploring = false,
  onSelectGroup,
  onCreateGroup,
  onExplore,
  allCount,
}: CreatorProductsCatalogueStripProps) {
  const chip =
    'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[14px] font-medium transition-colors duration-200';
  const idle =
    'border-black/[0.08] text-neutral-700 hover:border-black/20 hover:text-[#111111] dark:border-white/[0.1] dark:text-neutral-300 dark:hover:border-white/25 dark:hover:text-white';
  const selectedCls = 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]';

  return (
    <div>
      <div
        className="flex items-center gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label="Product catalogues"
      >
        <span className="mr-1 hidden shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500 sm:inline">
          Catalogues
        </span>
        <button
          type="button"
          aria-pressed={!selectedGroupId && !exploring}
          onClick={() => onSelectGroup(null)}
          className={`${chip} ${!selectedGroupId && !exploring ? selectedCls : idle}`}
        >
          All
          {allCount != null ? (
            <span
              className={`tabular-nums ${!selectedGroupId && !exploring ? 'text-white/60 dark:text-[#111111]/50' : 'text-neutral-400 dark:text-neutral-500'}`}
            >
              {allCount}
            </span>
          ) : null}
        </button>
        {onCreateGroup ? (
          <button
            type="button"
            onClick={onCreateGroup}
            aria-label="New catalogue"
            title="New catalogue"
            className={`${chip} border-dashed border-black/[0.2] text-[#111111] hover:border-[#111111] hover:bg-[#111111] hover:text-white dark:border-white/[0.22] dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-[#111111] ${
              groups.length > 0 ? 'w-9 justify-center !px-0' : ''
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {groups.length === 0 ? 'New catalogue' : null}
          </button>
        ) : null}
        {groups.map((group) => {
          const selected = selectedGroupId === group.id && !exploring;
          const count = groupCounts?.[group.id] ?? group.productCount;
          return (
            <button
              key={group.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectGroup(selected ? null : group.id)}
              className={`${chip} ${selected ? selectedCls : idle}`}
            >
              <span className="max-w-[10rem] truncate">{group.name}</span>
              <span
                className={`tabular-nums ${selected ? 'text-white/60 dark:text-[#111111]/50' : 'text-neutral-400 dark:text-neutral-500'}`}
              >
                {count}
              </span>
            </button>
          );
        })}
        {onExplore && groups.length > 0 ? (
          <button
            type="button"
            onClick={onExplore}
            aria-pressed={exploring}
            className={`${chip} ${exploring ? selectedCls : 'border-transparent text-[#111111] hover:text-[#FF5722] dark:text-white dark:hover:text-[#FF5722]'}`}
          >
            Explore all
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}

type CreatorProductsStatsPanelProps = {
  groups?: MarketplaceProductGroup[];
  /** Per-catalogue counts matching what the list shows when the catalogue is selected. */
  groupCounts?: Record<string, number>;
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
  groupCounts,
  selectedGroupId = null,
  exploring = false,
  readOnly = false,
  onSelectGroup,
  onCreateGroup,
  onExplore,
}: CreatorProductsStatsPanelProps) {
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const storefrontHref = user?.id ? `/providers/${user.id}` : '/studio';

  const visibleGroups = useMemo(() => groups.slice(0, SIDEBAR_GROUPS_LIMIT), [groups]);
  const hasMoreGroups = groups.length > SIDEBAR_GROUPS_LIMIT;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.06]">
          <h2 className="text-[15px] font-bold text-[#111111] dark:text-white">Catalogues</h2>
          {!readOnly && onCreateGroup ? (
            <button
              type="button"
              onClick={onCreateGroup}
              className="text-[14px] font-medium text-neutral-500 transition-colors hover:text-[#FF5722] dark:text-neutral-400 dark:hover:text-[#FF5722]"
            >
              + New
            </button>
          ) : null}
        </div>

        {groups.length === 0 ? (
          <p className="px-5 py-4 text-[14px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            {readOnly ? 'No catalogues yet.' : 'No catalogues yet. Create one to organize products.'}
          </p>
        ) : (
          <>
            <div
              className="divide-y divide-black/[0.06] dark:divide-white/[0.06]"
              role="list"
              aria-label="Product catalogues"
            >
              {visibleGroups.map((group) => {
                const selected = selectedGroupId === group.id && !exploring;
                const count = groupCounts?.[group.id] ?? group.productCount;
                return (
                  <button
                    key={group.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectGroup?.(selected ? null : group.id)}
                    className={`flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors ${
                      selected
                        ? 'bg-black/[0.03] dark:bg-white/[0.04]'
                        : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`truncate text-[15px] ${
                          selected
                            ? 'font-semibold text-[#111111] dark:text-white'
                            : 'font-medium text-neutral-700 dark:text-neutral-200'
                        }`}
                      >
                        {group.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-[14px] tabular-nums text-neutral-400 dark:text-neutral-500">
                      {count}
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
                className={`group/explore flex w-full items-center justify-between gap-2 border-t border-black/[0.06] px-5 py-3.5 text-[15px] font-medium transition-colors dark:border-white/[0.06] ${
                  exploring
                    ? 'text-[#FF5722]'
                    : 'text-[#111111] hover:text-[#FF5722] dark:text-white dark:hover:text-[#FF5722]'
                }`}
              >
                <span>
                  Explore all
                  {hasMoreGroups ? (
                    <span className="ml-1.5 text-[14px] font-normal tabular-nums text-neutral-400 dark:text-neutral-500">
                      ({groups.length})
                    </span>
                  ) : null}
                </span>
                <svg
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover/explore:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : null}
          </>
        )}
      </div>

      {!readOnly ? (
        <>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-black/[0.12] px-5 py-2.5 text-[15px] font-medium text-[#111111] transition-colors hover:border-black/25 dark:border-white/[0.12] dark:text-white dark:hover:border-white/25"
          >
            <GearIcon />
            Store settings
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
