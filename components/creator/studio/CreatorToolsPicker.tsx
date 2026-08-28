'use client';

import { useMemo, useRef, useState } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { resolveCreatorToolSimpleIcon } from '@/components/creator/studio/creator-tool-simple-icons';
import { uploadContentMedia } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

  const selectedValues = useMemo(() => normalizeSelected(value), [value]);
  const draftAutoIcon = useMemo(
    () => (!customIconUrl && customDraft.trim() ? resolveCreatorToolSimpleIcon(customDraft) : null),
    [customDraft, customIconUrl]
  );

  const syncSelectedValues = (nextValues: CreatorToolPick[]) => {
    onChange(normalizeSelected(nextValues).slice(0, max));
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

      {allowCustom ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            Ajouter un outil
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Nom + logo optionnel ({selectedValues.length}/{max}). Sans logo, la première lettre
            s’affiche.
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
              placeholder="Nom de l’outil…"
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
          ) : draftAutoIcon ? (
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Logo auto détecté : {draftAutoIcon.matchedName}. Tu peux quand même uploader un logo
              custom.
            </p>
          ) : (
            <p className="text-[11px] text-neutral-400">
              Optionnel : touche le cercle pour ajouter un logo. Sinon détection auto par nom, ou
              première lettre.
            </p>
          )}
          {uploadError ? <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
