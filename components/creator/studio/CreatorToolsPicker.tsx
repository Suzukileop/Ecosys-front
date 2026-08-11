'use client';

import { useMemo, useRef, useState } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  CREATOR_TOOL_PRESETS,
  findCreatorToolPreset,
  getCreatorToolCategories,
  type CreatorToolPreset,
} from '@/components/creator/studio/creator-profile-tools-catalog';
import { uploadContentMedia } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type ToolCategoryId = CreatorToolPreset['category'];

export type CreatorToolPick = {
  value: string;
  iconUrl?: string | null;
};

function normalizeSelected(values: CreatorToolPick[]): CreatorToolPick[] {
  const seen = new Set<string>();
  const result: CreatorToolPick[] = [];
  for (const raw of values) {
    const trimmed = raw.value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      value: trimmed,
      iconUrl: raw.iconUrl?.trim() ? raw.iconUrl.trim() : null,
    });
  }
  return result;
}

function ToolChip({
  item,
  onRemove,
  readOnly = false,
}: {
  item: CreatorToolPick;
  onRemove?: () => void;
  readOnly?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 py-1.5 pl-1.5 pr-2.5 text-xs font-medium text-neutral-900 dark:bg-amber-500/20 dark:text-neutral-50">
      <CreatorToolLogo label={item.value} iconUrl={item.iconUrl} size={22} />
      <span className="max-w-[12rem] truncate">{item.value}</span>
      {!readOnly && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full px-1 text-xs font-semibold text-neutral-500 transition hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
          aria-label={`Remove ${item.value}`}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}

function CategoryChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-3 w-3 shrink-0 text-neutral-400 transition-transform duration-200 ${
        expanded ? 'rotate-0' : '-rotate-90'
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PresetToolButton({
  preset,
  selected,
  disabled,
  onToggle,
}: {
  preset: CreatorToolPreset;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      aria-pressed={selected}
      className={`group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-30 ${
        selected
          ? 'bg-amber-500/20 text-neutral-900 shadow-none dark:bg-amber-500/25 dark:text-white'
          : 'bg-neutral-100/80 text-neutral-600 opacity-70 hover:bg-neutral-200/80 hover:opacity-100 dark:bg-white/[0.06] dark:text-neutral-300 dark:hover:bg-white/[0.1]'
      }`}
    >
      <span className={selected ? '' : 'grayscale'}>
        <CreatorToolLogo label={preset.name} preset={preset} size={20} />
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-xs leading-snug ${
          selected ? 'font-semibold' : 'font-medium'
        }`}
      >
        {preset.name}
      </span>
    </button>
  );
}

type CreatorToolsPickerProps = {
  value: CreatorToolPick[];
  onChange: (next: CreatorToolPick[]) => void;
  max?: number;
  readOnly?: boolean;
  allowCustom?: boolean;
  emptyLabel?: string;
};

export function CreatorToolsPicker({
  value,
  onChange,
  max = 8,
  readOnly = false,
  allowCustom = true,
  emptyLabel = 'No tools selected yet.',
}: CreatorToolsPickerProps) {
  const [customDraft, setCustomDraft] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<ToolCategoryId>>(() => new Set());

  const selectedValues = useMemo(() => normalizeSelected(value), [value]);
  const selectedKeys = useMemo(
    () => new Set(selectedValues.map((item) => item.value.toLowerCase())),
    [selectedValues]
  );

  const syncSelectedValues = (nextValues: CreatorToolPick[]) => {
    onChange(normalizeSelected(nextValues).slice(0, max));
  };

  const isPresetSelected = (preset: CreatorToolPreset): boolean =>
    selectedKeys.has(preset.name.toLowerCase()) ||
    selectedKeys.has(preset.id.toLowerCase()) ||
    (preset.aliases?.some((alias) => selectedKeys.has(alias.toLowerCase())) ?? false);

  const togglePreset = (preset: CreatorToolPreset) => {
    if (isPresetSelected(preset)) {
      const next = selectedValues.filter((item) => {
        const match = findCreatorToolPreset(item.value);
        return match?.id !== preset.id;
      });
      syncSelectedValues(next);
      return;
    }
    if (selectedValues.length >= max) return;
    syncSelectedValues([...selectedValues, { value: preset.name, iconUrl: null }]);
  };

  const addCustomTool = () => {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    if (selectedValues.some((item) => item.value.toLowerCase() === trimmed.toLowerCase())) {
      setCustomDraft('');
      setCustomIconUrl(null);
      return;
    }
    if (selectedValues.length >= max) return;
    syncSelectedValues([...selectedValues, { value: trimmed, iconUrl: customIconUrl }]);
    setCustomDraft('');
    setCustomIconUrl(null);
    setUploadError(null);
  };

  const onIconFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingIcon(true);
    setUploadError(null);
    try {
      const uploaded = await uploadContentMedia(file);
      setCustomIconUrl(uploaded);
    } catch (e) {
      setUploadError(getApiErrorMessage(e, 'Unable to upload logo.'));
    } finally {
      setUploadingIcon(false);
    }
  };

  const toggleCategory = (categoryId: ToolCategoryId) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const countSelectedInCategory = (categoryId: ToolCategoryId) =>
    CREATOR_TOOL_PRESETS.filter((preset) => preset.category === categoryId && isPresetSelected(preset))
      .length;

  if (readOnly) {
    if (selectedValues.length === 0) {
      return <p className="text-xs text-neutral-500 dark:text-neutral-400">{emptyLabel}</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {selectedValues.map((item) => (
          <ToolChip key={item.value} item={item} readOnly />
        ))}
      </div>
    );
  }

  const categories = getCreatorToolCategories();

  return (
    <div className="space-y-5">
      {selectedValues.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((item) => (
            <ToolChip
              key={item.value}
              item={item}
              onRemove={() =>
                syncSelectedValues(selectedValues.filter((entry) => entry.value !== item.value))
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-neutral-500 dark:text-neutral-400">{emptyLabel}</p>
      )}

      <div>
        <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          Pick from the catalog. {selectedValues.length}/{max} selected.
        </p>
        <div className="space-y-1">
          {categories.map((category) => {
            const expanded = expandedCategories.has(category.id);
            const presets = CREATOR_TOOL_PRESETS.filter((preset) => preset.category === category.id);
            const selectedCount = countSelectedInCategory(category.id);

            return (
              <div key={category.id}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-center gap-2 py-2 text-left transition hover:opacity-80"
                >
                  <CategoryChevron expanded={expanded} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                    {category.label}
                  </span>
                  <span className="ml-auto text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500">
                    {selectedCount > 0 ? `${selectedCount} · ` : ''}
                    {presets.length}
                  </span>
                </button>
                {expanded ? (
                  <div className="grid grid-cols-1 gap-1.5 pb-3 sm:grid-cols-2">
                    {presets.map((preset) => (
                      <PresetToolButton
                        key={preset.id}
                        preset={preset}
                        selected={isPresetSelected(preset)}
                        disabled={!isPresetSelected(preset) && selectedValues.length >= max}
                        onToggle={() => togglePreset(preset)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {allowCustom ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            Custom tool
          </p>
          <div className="flex items-center gap-2">
            <input
              ref={iconInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              onChange={(event) => void onIconFileChange(event)}
            />
            <button
              type="button"
              disabled={uploadingIcon || selectedValues.length >= max}
              onClick={() => iconInputRef.current?.click()}
              title="Upload logo"
              aria-label="Upload logo"
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100/80 transition hover:bg-neutral-200/80 disabled:opacity-40 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
            >
              {uploadingIcon ? (
                <LoadingSpinner size="sm" />
              ) : customIconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customIconUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <CreatorToolLogo label={customDraft || '?'} size={20} />
              )}
            </button>
            <input
              type="text"
              value={customDraft}
              onChange={(event) => setCustomDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addCustomTool();
                }
              }}
              placeholder="Not in the list…"
              className="min-w-0 flex-1 rounded-full bg-neutral-100/80 px-3.5 py-2 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:bg-neutral-100 focus:ring-2 focus:ring-[#F97316]/25 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-neutral-500 dark:focus:bg-white/[0.08]"
            />
            <button
              type="button"
              onClick={addCustomTool}
              disabled={!customDraft.trim() || selectedValues.length >= max}
              className="shrink-0 rounded-full bg-amber-500/20 px-3.5 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-500/30 disabled:opacity-40 dark:text-amber-300"
            >
              Add
            </button>
          </div>
          {customIconUrl ? (
            <button
              type="button"
              onClick={() => setCustomIconUrl(null)}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
            >
              Remove logo
            </button>
          ) : (
            <p className="text-[11px] text-neutral-400">Optional: tap the circle to add a small logo.</p>
          )}
          {uploadError ? <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
