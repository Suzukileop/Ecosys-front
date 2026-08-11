'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  LayoutOptionCard,
  LayoutRadioIndicator,
} from '@/components/creator/studio/LayoutOptionCard';
import {
  CREATOR_STUDIO_HEADER_LAYOUTS,
  isPremiumCreatorHeaderLayout,
  type CreatorStudioHeaderLayout,
} from '@/components/creator/studio/creator-studio-header';

type CreatorStudioHeaderLayoutPickerProps = {
  value: CreatorStudioHeaderLayout;
  saving?: boolean;
  onChange: (layout: CreatorStudioHeaderLayout) => void | Promise<void>;
  layoutIds?: CreatorStudioHeaderLayout[];
  className?: string;
  variant?: 'card' | 'row';
};

export function HeaderLayoutPreview({ layout }: { layout: CreatorStudioHeaderLayout }) {
  if (layout === 'VIP_GOLD') {
    return (
      <div className="relative overflow-hidden rounded-lg border border-amber-500/40 bg-neutral-950">
        <div className="h-10 bg-gradient-to-r from-amber-900/80 to-neutral-900" />
        <div className="absolute left-2 top-2 rounded-full bg-amber-500/30 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-wider text-amber-200">
          VIP
        </div>
        <div className="flex items-end gap-1.5 px-2 pb-2">
          <div className="-mt-3 h-6 w-6 rounded-full border border-amber-400 bg-amber-500/40 animate-vip-float" />
          <div className="flex-1 space-y-1 pb-0.5">
            <div className="h-1.5 w-3/4 rounded bg-gradient-to-r from-amber-200 to-amber-500" />
            <div className="grid grid-cols-3 gap-0.5">
              <div className="h-2 rounded bg-amber-500/20" />
              <div className="h-2 rounded bg-amber-500/20" />
              <div className="h-2 rounded bg-amber-500/20" />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 -translate-x-full animate-vip-shimmer bg-gradient-to-r from-transparent via-amber-200/30 to-transparent" />
      </div>
    );
  }

  if (layout === 'VIP_AURORA') {
    return (
      <div className="relative overflow-hidden rounded-lg border border-violet-500/30 bg-[#050510]">
        <div className="relative h-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/60 via-indigo-600/40 to-cyan-500/50" />
          <div className="absolute -left-2 top-0 h-10 w-10 rounded-full bg-violet-500/50 blur-md motion-reduce:animate-none animate-vip-aurora" />
          <div className="absolute -bottom-2 right-0 h-8 w-8 rounded-full bg-cyan-400/40 blur-md motion-reduce:animate-none animate-vip-aurora" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050510] to-transparent" />
          <div className="absolute left-2 top-2 rounded-full border border-cyan-400/30 bg-black/40 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-wider text-cyan-200">
            VIP
          </div>
        </div>
        <div className="relative -mt-3 px-2 pb-2">
          <div className="rounded-md border border-white/10 bg-black/50 p-1.5 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 shrink-0 rounded-full border border-violet-400/50 bg-violet-500/30" />
              <div className="h-1.5 flex-1 rounded bg-gradient-to-r from-white/80 to-cyan-300/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'STAGE') {
    return (
      <div className="relative overflow-hidden rounded-lg bg-neutral-950">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 via-neutral-900 to-neutral-950" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="relative flex min-h-[76px] flex-col items-center justify-center gap-1.5 pb-10 pt-3 text-center">
          <div className="relative h-7 w-7">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-white/80 to-white/30" />
            <div className="absolute inset-0 overflow-hidden rounded-full bg-neutral-600" />
          </div>
          <div className="space-y-0.5">
            <div className="mx-auto h-2 w-20 rounded-sm bg-white/90" />
            <div className="mx-auto h-1 w-12 rounded-sm bg-white/35" />
          </div>
        </div>
        <div className="absolute inset-x-1.5 bottom-1.5 overflow-hidden rounded-md border border-white/25 bg-white/10 px-2 py-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto h-1.5 w-4 rounded bg-white/70" />
                  <div className="mx-auto mt-0.5 h-1 w-3 rounded bg-white/25" />
                </div>
              ))}
            </div>
            <div className="ml-2 h-3 w-10 rounded-full bg-white/90" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'SPLIT') {
    return (
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="grid grid-cols-2">
          <div className="space-y-1.5 p-2">
            <div className="flex gap-1.5">
              <div className="h-4 w-4 rounded bg-orange-400" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1.5 w-full rounded bg-neutral-300 dark:bg-neutral-600" />
                <div className="h-1 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-2 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-2 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-2 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
            <div className="h-2 w-1/2 rounded-full bg-neutral-900 dark:bg-white" />
          </div>
          <div className="min-h-[52px] border-l border-neutral-300 bg-white dark:border-neutral-800 dark:bg-black" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="h-8 bg-white dark:bg-black" />
      <div className="flex items-end gap-1.5 px-2 pb-2">
        <div className="-mt-2 h-5 w-5 rounded-full border-2 border-white bg-orange-400 dark:border-neutral-900" />
        <div className="flex-1 space-y-0.5 pb-0.5">
          <div className="h-1.5 w-2/3 rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}

function HeaderLayoutPreviewPanel({ layout }: { layout: CreatorStudioHeaderLayout }) {
  return (
    <div className="overflow-hidden rounded-md border border-neutral-300/70 bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-950/80">
      <HeaderLayoutPreview layout={layout} />
    </div>
  );
}

export function CreatorStudioHeaderLayoutPicker({
  value,
  saving = false,
  onChange,
  layoutIds,
  className = 'grid gap-3 sm:grid-cols-2',
  variant = 'card',
}: CreatorStudioHeaderLayoutPickerProps) {
  const options = layoutIds
    ? CREATOR_STUDIO_HEADER_LAYOUTS.filter((option) => layoutIds.includes(option.id))
    : CREATOR_STUDIO_HEADER_LAYOUTS;

  const listClass = variant === 'row' ? 'grid grid-cols-2 gap-2' : className;

  return (
    <div className={listClass}>
      {options.map((option) => {
        const selected = value === option.id;
        const premium = isPremiumCreatorHeaderLayout(option.id);

        if (variant === 'row') {
          return (
            <LayoutOptionCard
              key={option.id}
              selected={selected}
              premium={premium}
              disabled={saving}
              onClick={() => void onChange(option.id)}
              className={!selected ? 'opacity-60' : undefined}
            >
              <HeaderLayoutPreviewPanel layout={option.id} />
              <div className="mt-2 flex items-center gap-2">
                <LayoutRadioIndicator
                  compact
                  selected={selected}
                  premium={premium}
                  saving={selected && saving}
                />
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{option.label}</p>
              </div>
            </LayoutOptionCard>
          );
        }

        return (
          <LayoutOptionCard
            key={option.id}
            selected={selected}
            premium={premium}
            disabled={saving}
            onClick={() => void onChange(option.id)}
          >
            {premium && (
              <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-amber-400 to-violet-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg">
                VIP
              </span>
            )}
            <HeaderLayoutPreview layout={option.id} />
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="min-w-0 pr-8">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{option.label}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{option.description}</p>
              </div>
              {selected && saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected
                      ? premium
                        ? 'border-violet-500 bg-violet-500 text-white'
                        : 'border-orange-400 bg-orange-400 text-white'
                      : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                  aria-hidden
                >
                  {selected ? '✓' : ''}
                </span>
              )}
            </div>
          </LayoutOptionCard>
        );
      })}
    </div>
  );
}
