'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { ProfileFormValues } from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
  profileSectionSubheadingClass,
} from '@/components/creator/studio/profile-section-ui';
import { fetchLanguageProficiencyLevels } from '@/lib/reference-api';
import {
  DEFAULT_LANGUAGE_PROFICIENCY_LEVELS,
  dedupeSpokenLanguageEntries,
  resolveSpokenLanguageLevelLabel,
  SPOKEN_LANGUAGE_PRESETS,
  spokenLanguageMatchKey,
  type SpokenLanguageEntry,
} from '@/lib/spoken-languages';

const MAX_LANGUAGES = 20;

type ProfileLanguagesFieldProps = {
  control: Control<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  readOnly?: boolean;
  values?: SpokenLanguageEntry[];
};

export function ProfileLanguagesField({
  control,
  setValue,
  readOnly = false,
  values = [],
}: ProfileLanguagesFieldProps) {
  const watched = useWatch({ control, name: 'spokenLanguages' });
  const [customDraft, setCustomDraft] = useState('');
  const [levelOptions, setLevelOptions] = useState(DEFAULT_LANGUAGE_PROFICIENCY_LEVELS);

  useEffect(() => {
    void fetchLanguageProficiencyLevels().then(setLevelOptions);
  }, []);

  const selected = useMemo(() => {
    const source = readOnly ? values : (watched ?? []);
    return dedupeSpokenLanguageEntries(
      source.map((item) => ({
        value: item.value,
        level: item.level ?? null,
      }))
    );
  }, [readOnly, values, watched]);

  const selectedKeys = useMemo(
    () => new Set(selected.map((value) => spokenLanguageMatchKey(value.value))),
    [selected]
  );

  useEffect(() => {
    if (readOnly) return;
    const raw = (watched ?? []).map((item) => ({
      value: item.value,
      level: item.level ?? null,
    }));
    const deduped = dedupeSpokenLanguageEntries(raw);
    const changed =
      raw.length !== deduped.length ||
      raw.some((item, index) => {
        const next = deduped[index];
        return (
          !next ||
          item.value !== next.value ||
          (item.level ?? null) !== (next.level ?? null)
        );
      });
    if (changed) {
      setValue('spokenLanguages', deduped, { shouldDirty: false, shouldValidate: true });
    }
  }, [readOnly, setValue, watched]);

  const sync = (next: SpokenLanguageEntry[]) => {
    setValue('spokenLanguages', dedupeSpokenLanguageEntries(next), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const togglePreset = (language: string) => {
    const key = spokenLanguageMatchKey(language);
    if (selectedKeys.has(key)) {
      sync(selected.filter((value) => spokenLanguageMatchKey(value.value) !== key));
      return;
    }
    if (selected.length >= MAX_LANGUAGES) return;
    sync([...selected, { value: language, level: null }]);
  };

  const customSelected = useMemo(
    () =>
      selected.filter(
        (language) =>
          !SPOKEN_LANGUAGE_PRESETS.some(
            (preset) => spokenLanguageMatchKey(preset) === spokenLanguageMatchKey(language.value)
          )
      ),
    [selected]
  );

  const removeLanguage = (language: string) => {
    const key = spokenLanguageMatchKey(language);
    sync(selected.filter((value) => spokenLanguageMatchKey(value.value) !== key));
  };

  const updateLevel = (language: string, level: SpokenLanguageEntry['level']) => {
    const key = spokenLanguageMatchKey(language);
    sync(
      selected.map((item) =>
        spokenLanguageMatchKey(item.value) === key ? { ...item, level: level ?? null } : item
      )
    );
  };

  const addCustom = () => {
    const trimmed = customDraft.trim();
    if (!trimmed || selectedKeys.has(spokenLanguageMatchKey(trimmed)) || selected.length >= MAX_LANGUAGES) {
      return;
    }
    sync([...selected, { value: trimmed, level: null }]);
    setCustomDraft('');
  };

  if (readOnly) {
    if (selected.length === 0) {
      return <p className={profileSectionEmptyClass}>Aucune langue renseignée.</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {selected.map((language) => {
          const levelLabel = resolveSpokenLanguageLevelLabel(language.level, levelOptions);
          return (
            <span
              key={spokenLanguageMatchKey(language.value)}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {language.value}
              {levelLabel ? (
                <span className="ml-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  · {levelLabel}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={profileSectionSubheadingClass}>Langues de travail</p>
        <p className={`mt-1 ${profileSectionMutedTextClass}`}>
          Sélectionnez les langues dans lesquelles vous travaillez et indiquez votre niveau.{' '}
          {selected.length}/{MAX_LANGUAGES} ajoutées.
        </p>
      </div>

      {selected.length > 0 ? (
        <div className="space-y-2">
          {selected.map((language) => (
            <div
              key={spokenLanguageMatchKey(language.value)}
              className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-700"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {language.value}
                </span>
                <button
                  type="button"
                  onClick={() => removeLanguage(language.value)}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  Retirer
                </button>
              </div>
              <select
                value={language.level ?? ''}
                onChange={(event) =>
                  updateLevel(
                    language.value,
                    event.target.value ? (event.target.value as SpokenLanguageEntry['level']) : null
                  )
                }
                className={`${profileFormInputClass} w-full sm:max-w-[220px]`}
              >
                <option value="">Niveau (optionnel)</option>
                {levelOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : null}

      {customSelected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {customSelected.map((language) => (
            <button
              key={spokenLanguageMatchKey(language.value)}
              type="button"
              onClick={() => removeLanguage(language.value)}
              className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200"
            >
              {language.value}
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {SPOKEN_LANGUAGE_PRESETS.map((language) => {
          const active = selectedKeys.has(spokenLanguageMatchKey(language));
          return (
            <button
              key={language}
              type="button"
              disabled={!active && selected.length >= MAX_LANGUAGES}
              onClick={() => togglePreset(language)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 ${
                active
                  ? 'border-orange-400 bg-orange-50 text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200'
              }`}
            >
              {language}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={customDraft}
          onChange={(event) => setCustomDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addCustom();
            }
          }}
          placeholder="Autre langue…"
          className={`${profileFormInputClass} min-w-0 flex-1`}
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={
            !customDraft.trim() ||
            selected.length >= MAX_LANGUAGES ||
            selectedKeys.has(spokenLanguageMatchKey(customDraft))
          }
          className="inline-flex shrink-0 justify-center rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
