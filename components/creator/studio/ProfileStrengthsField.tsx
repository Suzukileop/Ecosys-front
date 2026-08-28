'use client';

import { useMemo, useRef, useState } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { SkillTagsEditor } from '@/components/creator/studio/SkillTagsEditor';
import { resolveCreatorToolSimpleIcon } from '@/components/creator/studio/creator-tool-simple-icons';
import type {
  ProfileFormValues,
  StrengthFormItem,
  StrengthToolLevel,
} from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
  profileSectionSubheadingClass,
} from '@/components/creator/studio/profile-section-ui';
import { getSkillUsageDescription } from '@/components/portfolio/skill-usage-descriptions';
import { uploadContentMedia } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const MAX_STRENGTHS = 12;
const MAX_DESCRIPTION = 280;
const MAX_USE_CASES = 8;

const LEVEL_OPTIONS: { value: StrengthToolLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

type ProfileStrengthsFieldProps = {
  control: Control<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  readOnly?: boolean;
  values?: StrengthFormItem[];
  allowedSpecialties?: string[];
};

function emptyStrengthItem(value: string, category = ''): StrengthFormItem {
  return {
    value,
    description: '',
    category,
    level: null,
    useCases: [],
    experienceYears: null,
    experienceLabel: '',
    currentlyUsed: null,
    iconUrl: null,
  };
}

function normalizeSelected(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

export function ProfileStrengthsField({
  control,
  setValue,
  readOnly = false,
  values = [],
  allowedSpecialties: _allowedSpecialties = [],
}: ProfileStrengthsFieldProps) {
  const watchedStrengths = useWatch({ control, name: 'strengthsTools' });
  const watchedSkillTags = useWatch({ control, name: 'specialtyTags' }) ?? [];
  const [customDraft, setCustomDraft] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [useCaseDraftByLabel, setUseCaseDraftByLabel] = useState<Record<string, string>>({});

  const skillTagsBlock = (
    <section className="space-y-2">
      <p className={profileSectionSubheadingClass}>Stack</p>
      <p className={profileSectionMutedTextClass}>
        Keyword tags shown under Stack in Profile info on your public profile.
      </p>
      <SkillTagsEditor
        tags={Array.isArray(watchedSkillTags) ? watchedSkillTags : []}
        onChange={(next) => setValue('specialtyTags', next, { shouldDirty: true })}
        editable={!readOnly}
      />
    </section>
  );

  const formItems = useMemo((): StrengthFormItem[] => {
    if (readOnly) return values;
    return watchedStrengths ?? [];
  }, [readOnly, values, watchedStrengths]);

  const selectedValues = useMemo(
    () => normalizeSelected(formItems.map((item) => item.value)),
    [formItems]
  );

  const itemByLabel = useMemo(() => {
    const map = new Map<string, StrengthFormItem>();
    for (const item of formItems) {
      map.set(item.value.toLowerCase(), item);
    }
    return map;
  }, [formItems]);

  const draftAutoIcon = useMemo(
    () => (!customIconUrl && customDraft.trim() ? resolveCreatorToolSimpleIcon(customDraft) : null),
    [customDraft, customIconUrl]
  );

  const syncSelectedValues = (
    nextValues: string[],
    seedCategoryByValue?: Map<string, string>,
    seedIconByValue?: Map<string, string | null>
  ) => {
    const previous = new Map(
      (watchedStrengths ?? []).map((item) => [item.value.toLowerCase(), item] as const)
    );
    setValue(
      'strengthsTools',
      normalizeSelected(nextValues).map((value) => {
        const existing = previous.get(value.toLowerCase());
        if (existing) return existing;
        const category = seedCategoryByValue?.get(value.toLowerCase()) ?? '';
        const created = emptyStrengthItem(value, category);
        const iconUrl = seedIconByValue?.get(value.toLowerCase());
        return iconUrl ? { ...created, iconUrl } : created;
      }),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const updateItem = (label: string, patch: Partial<StrengthFormItem>) => {
    const next = (watchedStrengths ?? []).map((item) =>
      item.value === label ? { ...item, ...patch } : item
    );
    setValue('strengthsTools', next, { shouldDirty: true, shouldValidate: true });
  };

  const addCustomTool = () => {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    if (selectedValues.some((value) => value.toLowerCase() === trimmed.toLowerCase())) {
      setCustomDraft('');
      setCustomIconUrl(null);
      return;
    }
    if (selectedValues.length >= MAX_STRENGTHS) return;
    const seeds = new Map([[trimmed.toLowerCase(), '']]);
    const iconSeeds = customIconUrl
      ? new Map([[trimmed.toLowerCase(), customIconUrl]])
      : undefined;
    syncSelectedValues([...selectedValues, trimmed], seeds, iconSeeds);
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

  const addUseCase = (label: string) => {
    const draft = (useCaseDraftByLabel[label] ?? '').trim();
    if (!draft) return;
    const item = itemByLabel.get(label.toLowerCase());
    const current = item?.useCases ?? [];
    if (current.length >= MAX_USE_CASES) return;
    if (current.some((entry) => entry.toLowerCase() === draft.toLowerCase())) {
      setUseCaseDraftByLabel((prev) => ({ ...prev, [label]: '' }));
      return;
    }
    updateItem(label, { useCases: [...current, draft.slice(0, 60)] });
    setUseCaseDraftByLabel((prev) => ({ ...prev, [label]: '' }));
  };

  const removeUseCase = (label: string, useCase: string) => {
    const item = itemByLabel.get(label.toLowerCase());
    updateItem(label, {
      useCases: (item?.useCases ?? []).filter((entry) => entry !== useCase),
    });
  };

  if (readOnly) {
    const toolsBlock =
      selectedValues.length === 0 ? (
        <p className={profileSectionEmptyClass}>Aucun outil ajouté pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {selectedValues.map((item) => {
            const data = itemByLabel.get(item.toLowerCase());
            const custom = data?.description?.trim() ?? '';
            const body = custom || getSkillUsageDescription(item);
            return (
              <div
                key={item}
                className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950"
              >
                <div className="flex items-center gap-3">
                  <CreatorToolLogo label={item} iconUrl={data?.iconUrl} size={28} />
                  <p className="truncate text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">
                    {item}
                  </p>
                </div>
                {body ? (
                  <p className={`mt-2 text-sm ${profileSectionMutedTextClass}`}>{body}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      );

    return (
      <div className="space-y-6">
        {skillTagsBlock}
        <section className="space-y-3">
          <p className={profileSectionSubheadingClass}>Tools</p>
          {toolsBlock}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {skillTagsBlock}
      <section className="space-y-5">
        <p className={profileSectionSubheadingClass}>Tools</p>
      {selectedValues.length > 0 && (
        <div className="space-y-3">
          <div>
            <p className={`mb-1 ${profileSectionSubheadingClass}`}>Sélection</p>
            <p className={profileSectionMutedTextClass}>
              Affinez chaque outil : niveau, cas d&apos;usage et description. Sans logo uploadé,
              la première lettre s&apos;affiche.
            </p>
          </div>
          {selectedValues.map((label) => {
            const item = itemByLabel.get(label.toLowerCase()) ?? emptyStrengthItem(label);
            const description = item.description ?? '';
            const autoPreview = getSkillUsageDescription(label);
            const useCases = item.useCases ?? [];
            const useCaseDraft = useCaseDraftByLabel[label] ?? '';
            return (
              <div
                key={label}
                className="rounded-2xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-700 dark:bg-neutral-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <CreatorToolLogo label={label} iconUrl={item.iconUrl} size={28} />
                    <p className="truncate text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">
                      {label}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      syncSelectedValues(selectedValues.filter((value) => value !== label))
                    }
                    className="shrink-0 rounded-full px-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Retirer
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                      Niveau
                    </span>
                    <select
                      value={item.level ?? ''}
                      onChange={(event) =>
                        updateItem(label, {
                          level: (event.target.value || null) as StrengthToolLevel | null,
                        })
                      }
                      className={`mt-1.5 ${profileFormInputClass}`}
                    >
                      <option value="">Non renseigné</option>
                      {LEVEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-3 block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    Description
                  </span>
                  <textarea
                    rows={2}
                    maxLength={MAX_DESCRIPTION}
                    value={description}
                    onChange={(event) => updateItem(label, { description: event.target.value })}
                    placeholder={autoPreview}
                    className={`mt-1.5 ${profileFormInputClass} min-h-[4.5rem] resize-y`}
                  />
                </label>
                <p className={`mt-1.5 text-xs ${profileSectionMutedTextClass}`}>
                  {description.trim()
                    ? `${description.trim().length}/${MAX_DESCRIPTION}`
                    : `Auto : ${autoPreview}`}
                </p>

                <div className="mt-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    Cas d&apos;usage
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {useCases.map((useCase) => (
                      <span
                        key={useCase}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      >
                        {useCase}
                        <button
                          type="button"
                          onClick={() => removeUseCase(label, useCase)}
                          className="text-neutral-400 hover:text-red-500"
                          aria-label={`Retirer ${useCase}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={useCaseDraft}
                      maxLength={60}
                      disabled={useCases.length >= MAX_USE_CASES}
                      onChange={(event) =>
                        setUseCaseDraftByLabel((prev) => ({
                          ...prev,
                          [label]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addUseCase(label);
                        }
                      }}
                      placeholder={
                        useCases.length >= MAX_USE_CASES
                          ? 'Maximum 8 cas d’usage'
                          : 'Ajouter un cas d’usage'
                      }
                      className={profileFormInputClass}
                    />
                    <button
                      type="button"
                      onClick={() => addUseCase(label)}
                      disabled={!useCaseDraft.trim() || useCases.length >= MAX_USE_CASES}
                      className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-neutral-200 p-4 dark:border-neutral-700">
        <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
          Ajouter un outil
        </p>
        <p className={`mt-1 ${profileSectionMutedTextClass}`}>
          Nom + logo optionnel ({selectedValues.length}/{MAX_STRENGTHS}). Logo auto si le nom est
          reconnu ; sinon première lettre. Upload = priorité.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={iconInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            onChange={(event) => void onIconFileChange(event)}
          />
          <button
            type="button"
            disabled={uploadingIcon || selectedValues.length >= MAX_STRENGTHS}
            onClick={() => iconInputRef.current?.click()}
            title="Upload logo"
            aria-label="Upload logo"
            className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 transition hover:bg-neutral-200 disabled:opacity-40 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
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
            placeholder="Nom de l’outil"
            className={profileFormInputClass}
          />
          <button
            type="button"
            onClick={addCustomTool}
            disabled={!customDraft.trim() || selectedValues.length >= MAX_STRENGTHS}
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ajouter
          </button>
        </div>
        {customIconUrl ? (
          <button
            type="button"
            onClick={() => setCustomIconUrl(null)}
            className="mt-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
          >
            Retirer le logo
          </button>
        ) : draftAutoIcon ? (
          <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Logo auto détecté : {draftAutoIcon.matchedName}. Tu peux uploader un logo custom pour
            le remplacer.
          </p>
        ) : null}
        {uploadError ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{uploadError}</p> : null}
      </div>
      </section>
    </div>
  );
}
