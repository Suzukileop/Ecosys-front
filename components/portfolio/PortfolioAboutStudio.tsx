'use client';

import { memo, useEffect, useId, useState, type ReactNode } from 'react';
import { SpecialtyMultiSelect } from '@/components/creator/studio/SpecialtyMultiSelect';
import { PortfolioFieldVisibilityMenu } from '@/components/portfolio/PortfolioInformationChrome';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_BLOCK_CLASS,
  STUDIO_EMPTY_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_ROW_RULE,
  STUDIO_SECONDARY_CLASS,
  STUDIO_VALUE_CLASS,
  STUDIO_INLINE_TEXT_CLASS,
  StudioField,
  StudioIconAction,
  StudioMenuSelect,
  StudioFoldToggle as FoldToggle,
  StudioRemoveButton,
  StudioSaveChrome,
  StudioSectionHeader,
  StudioSlashLine as SlashLine,
  StudioUnderline,
  useInlineStudio,
  useStudioFold,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';
import {
  MAX_ABOUT_SKILLS,
  MAX_ABOUT_SKILL_DESCRIPTION,
  MAX_ABOUT_SKILL_TITLE,
  createEmptyAboutSkillEntry,
} from '@/lib/about-skills';
import {
  DEFAULT_LANGUAGE_PROFICIENCY_LEVELS,
  SPOKEN_LANGUAGE_PRESETS,
  dedupeSpokenLanguageEntries,
  resolveSpokenLanguageLevelLabel,
  spokenLanguageMatchKey,
  type SpokenLanguageEntry,
} from '@/lib/spoken-languages';
import { fetchLanguageProficiencyLevels } from '@/lib/reference-api';
import type { ContactVisibilityLevel } from '@/lib/contact-visibility';
import type { ProfileEducationEntry, ProfileSkillEntry } from '@/types/profile';

export type PortfolioAboutDraft = {
  specialties: string[];
  specialtyTags: string[];
  yearsOfExperience: number | null;
  languages: SpokenLanguageEntry[];
  aboutEducation: ProfileEducationEntry[];
  aboutSkills: ProfileSkillEntry[];
  aboutStrengths: string[];
  aboutSystemsTools: string[];
  aboutInterests: string[];
};

type DraftKey = keyof PortfolioAboutDraft;
type ListKey = 'aboutStrengths' | 'aboutSystemsTools' | 'aboutInterests';
type ChangeHandler = StudioChangeHandler<PortfolioAboutDraft>;

type AboutVisibilityKey =
  | 'yearsOfExperience'
  | 'spokenLanguages'
  | 'aboutEducation'
  | 'aboutSkills'
  | 'aboutStrengths'
  | 'aboutSystemsTools'
  | 'aboutInterests';

type VisibilityProps = {
  visibility: Partial<Record<AboutVisibilityKey, ContactVisibilityLevel>>;
  onVisibilityChange: (key: AboutVisibilityKey, level: ContactVisibilityLevel) => void;
};

const VALUE_CLASS = STUDIO_VALUE_CLASS;
const SECONDARY_CLASS = STUDIO_SECONDARY_CLASS;
const ROW_RULE = STUDIO_ROW_RULE;
const EMPTY_CLASS = STUDIO_EMPTY_CLASS;

const trimmedFilled = (values: string[]) => values.map((value) => value.trim()).filter(Boolean);

/** Compares content only — ids, ordering metadata and blank rows never count as a change. */
function aboutSignature(key: DraftKey, value: PortfolioAboutDraft[DraftKey]): string {
  switch (key) {
    case 'aboutEducation':
      return JSON.stringify(
        (value as ProfileEducationEntry[])
          .map((entry) => [entry.schoolYear.trim(), entry.title.trim(), entry.institution.trim()])
          .filter((parts) => parts.some(Boolean))
      );
    case 'aboutSkills':
      return JSON.stringify(
        (value as ProfileSkillEntry[])
          .map((entry) => [entry.title.trim(), entry.description.trim()])
          .filter((parts) => parts.some(Boolean))
      );
    case 'languages':
      return JSON.stringify(
        (value as SpokenLanguageEntry[]).map((entry) => [entry.value.trim(), entry.level ?? null])
      );
    case 'specialties':
    case 'specialtyTags':
    case 'aboutStrengths':
    case 'aboutSystemsTools':
    case 'aboutInterests':
      return JSON.stringify(trimmedFilled(value as string[]));
    default:
      return String(value ?? '');
  }
}

function VisibilityControl({
  field,
  visibility,
  onVisibilityChange,
}: VisibilityProps & { field: AboutVisibilityKey }) {
  const level = visibility[field];
  if (!level) return null;
  return (
    <PortfolioFieldVisibilityMenu
      value={level}
      onChange={(next) => onVisibilityChange(field, next)}
      menuPlacement="down"
    />
  );
}

const SpecialtyField = memo(function SpecialtyField({
  defaultSpecialties,
  defaultTags,
  onChange,
}: {
  defaultSpecialties: string[];
  defaultTags: string[];
  onChange: ChangeHandler;
}) {
  const [specialties, setSpecialties] = useState(defaultSpecialties);
  const [tags, setTags] = useState(defaultTags);
  const [open, setOpen] = useStudioFold();
  const filled = trimmedFilled(specialties);
  return (
    <StudioField label="Specialty" aside={<FoldToggle open={open} onClick={() => setOpen(!open)} />}>
      {open ? null : filled.length > 0 ? (
        <SlashLine
          items={filled.map((item) => (
            <span key={item} className={VALUE_CLASS}>
              {item}
            </span>
          ))}
        />
      ) : (
        <p className={`pb-3 ${EMPTY_CLASS}`}>No specialty yet</p>
      )}
      {open ? (
        <div style={STUDIO_FLOAT_IN_STYLE} className="pb-5">
          <SpecialtyMultiSelect
            specialties={specialties}
            tags={tags}
            showTags={false}
            variant="studio"
            onSpecialtiesChange={(next) => {
              setSpecialties(next);
              onChange('specialties', next);
            }}
            onTagsChange={(next) => {
              setTags(next);
              onChange('specialtyTags', next);
            }}
          />
        </div>
      ) : null}
    </StudioField>
  );
});

const ExperienceField = memo(function ExperienceField({
  defaultValue,
  aside,
  onChange,
  onCommit,
}: {
  defaultValue: number | null;
  aside?: ReactNode;
  onChange: ChangeHandler;
  onCommit: () => void;
}) {
  const id = useId();
  return (
    <StudioField label="Experience" htmlFor={id} aside={aside}>
      <div className="flex items-baseline gap-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          maxLength={2}
          defaultValue={defaultValue != null ? String(defaultValue) : ''}
          placeholder="0"
          onChange={(event) => {
            const digits = event.currentTarget.value.replace(/\D/g, '');
            onChange('yearsOfExperience', digits ? Math.min(80, Number.parseInt(digits, 10)) : null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onCommit();
            }
          }}
          className={`${STUDIO_INLINE_TEXT_CLASS} !w-[3ch] tabular-nums`}
        />
        <span className={`pb-3 ${SECONDARY_CLASS}`}>years</span>
      </div>
    </StudioField>
  );
});

function LanguagesEditor({
  value,
  onChange,
}: {
  value: SpokenLanguageEntry[];
  onChange: (next: SpokenLanguageEntry[]) => void;
}) {
  const [levels, setLevels] = useState(DEFAULT_LANGUAGE_PROFICIENCY_LEVELS);
  const [draft, setDraft] = useState('');
  const selected = dedupeSpokenLanguageEntries(value);
  const selectedKeys = new Set(selected.map((item) => spokenLanguageMatchKey(item.value)));
  const suggestions = SPOKEN_LANGUAGE_PRESETS.filter((preset) => !selectedKeys.has(spokenLanguageMatchKey(preset)));

  useEffect(() => {
    void fetchLanguageProficiencyLevels().then(setLevels);
  }, []);

  const sync = (next: SpokenLanguageEntry[]) => onChange(dedupeSpokenLanguageEntries(next));
  const add = (language: string) => {
    const trimmed = language.trim();
    if (!trimmed || selectedKeys.has(spokenLanguageMatchKey(trimmed))) return;
    sync([...selected, { value: trimmed, level: null }]);
  };
  const remove = (language: string) =>
    sync(selected.filter((item) => spokenLanguageMatchKey(item.value) !== spokenLanguageMatchKey(language)));
  const setLevel = (language: string, level: SpokenLanguageEntry['level']) =>
    sync(
      selected.map((item) =>
        spokenLanguageMatchKey(item.value) === spokenLanguageMatchKey(language) ? { ...item, level } : item
      )
    );

  return (
    <div className="space-y-6">
      {selected.length > 0 ? (
        <ul>
          {selected.map((language) => (
            <li
              key={spokenLanguageMatchKey(language.value)}
              className={`group/row flex items-center gap-4 py-3 first:pt-0 ${ROW_RULE}`}
            >
              <span className={`min-w-0 flex-1 truncate ${VALUE_CLASS}`}>{language.value}</span>
              <StudioMenuSelect
                value={language.level ?? null}
                ariaLabel={`Level for ${language.value}`}
                placeholder="Level"
                options={[
                  ...levels.map((option) => ({
                    value: option.code as NonNullable<SpokenLanguageEntry['level']>,
                    label: option.label,
                  })),
                  { value: null, label: 'No level' },
                ]}
                onChange={(next) => setLevel(language.value, next)}
              />
              <StudioRemoveButton label={`Remove ${language.value}`} onClick={() => remove(language.value)} />
            </li>
          ))}
        </ul>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => add(language)}
              className="h-9 rounded-full border border-black/[0.08] px-3.5 text-[14px] text-neutral-600 transition-colors duration-200 hover:border-black hover:bg-black hover:text-white dark:border-white/[0.1] dark:text-neutral-300 dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
            >
              + {language}
            </button>
          ))}
        </div>
      ) : null}

      <StudioUnderline className="max-w-sm">
        <input
          type="text"
          value={draft}
          placeholder="Other language — press Enter"
          aria-label="Add another language"
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add(draft);
              setDraft('');
            }
          }}
          className={`${STUDIO_BARE_INPUT_CLASS} pb-2 ${VALUE_CLASS}`}
        />
      </StudioUnderline>
    </div>
  );
}

const LanguagesField = memo(function LanguagesField({
  defaultValue,
  aside,
  onChange,
}: {
  defaultValue: SpokenLanguageEntry[];
  aside?: ReactNode;
  onChange: ChangeHandler;
}) {
  const [languages, setLanguages] = useState(defaultValue);
  const [open, setOpen] = useStudioFold();
  const filled = languages.filter((language) => language.value.trim());
  return (
    <StudioField
      label="Languages"
      aside={
        <div className="flex items-center gap-3">
          <FoldToggle open={open} onClick={() => setOpen(!open)} />
          {aside}
        </div>
      }
    >
      {open ? null : filled.length > 0 ? (
        <SlashLine
          items={filled.map((language) => {
            const level = resolveSpokenLanguageLevelLabel(language.level);
            return (
              <span key={language.value} className="inline-flex items-baseline gap-2">
                <span className={VALUE_CLASS}>{language.value}</span>
                {level ? <span className={SECONDARY_CLASS}>{level}</span> : null}
              </span>
            );
          })}
        />
      ) : (
        <p className={`pb-3 ${EMPTY_CLASS}`}>No language yet</p>
      )}
      {open ? (
        <div style={STUDIO_FLOAT_IN_STYLE} className="pb-5">
          <LanguagesEditor
            value={languages}
            onChange={(next) => {
              setLanguages(next);
              onChange('languages', next);
            }}
          />
        </div>
      ) : null}
    </StudioField>
  );
});

const EducationSection = memo(function EducationSection({
  defaultValue,
  aside,
  onChange,
}: {
  defaultValue: ProfileEducationEntry[];
  aside?: ReactNode;
  onChange: ChangeHandler;
}) {
  const [entries, setEntries] = useState(defaultValue);
  const [focusId, setFocusId] = useState<string | null>(null);

  const commit = (next: ProfileEducationEntry[]) => {
    setEntries(next);
    onChange('aboutEducation', next);
  };
  const update = (id: string, patch: Partial<ProfileEducationEntry>) =>
    commit(entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  const add = () => {
    const id = crypto.randomUUID();
    setFocusId(id);
    commit([...entries, { id, sortOrder: entries.length, schoolYear: '', title: '', institution: '' }]);
  };

  return (
    <section className={STUDIO_BLOCK_CLASS} aria-label="Education">
      <div className="min-w-0">
        <StudioSectionHeader label="Education">
          <StudioIconAction icon="add" label="Add education" onClick={add} disabled={entries.length >= 8} />
          {aside}
        </StudioSectionHeader>
        {entries.length === 0 ? (
          <p className={EMPTY_CLASS}>No education yet</p>
        ) : (
          <ol>
            {entries.map((entry) => (
              <li
                key={entry.id}
                className={`group/row grid grid-cols-1 gap-x-10 gap-y-1 py-4 first:pt-1 sm:grid-cols-[9.5rem_minmax(0,1fr)_auto] sm:items-baseline ${ROW_RULE}`}
              >
                <StudioUnderline quiet>
                  <input
                    type="text"
                    value={entry.schoolYear}
                    placeholder="2017 – 2019"
                    aria-label="Years"
                    autoFocus={entry.id === focusId}
                    onChange={(event) => update(entry.id, { schoolYear: event.currentTarget.value })}
                    className={`${STUDIO_BARE_INPUT_CLASS} tabular-nums ${SECONDARY_CLASS}`}
                  />
                </StudioUnderline>
                <div className="min-w-0">
                  <StudioUnderline quiet>
                    <input
                      type="text"
                      value={entry.title}
                      placeholder="Master / Licence"
                      aria-label="Degree"
                      onChange={(event) => update(entry.id, { title: event.currentTarget.value })}
                      className={`${STUDIO_BARE_INPUT_CLASS} ${VALUE_CLASS}`}
                    />
                  </StudioUnderline>
                  <StudioUnderline quiet className="mt-0.5">
                    <input
                      type="text"
                      value={entry.institution}
                      placeholder="University"
                      aria-label="Institution"
                      onChange={(event) => update(entry.id, { institution: event.currentTarget.value })}
                      className={`${STUDIO_BARE_INPUT_CLASS} ${SECONDARY_CLASS}`}
                    />
                  </StudioUnderline>
                </div>
                <StudioRemoveButton
                  label="Remove education entry"
                  onClick={() => commit(entries.filter((item) => item.id !== entry.id))}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
});

const SkillsSection = memo(function SkillsSection({
  defaultValue,
  aside,
  onChange,
}: {
  defaultValue: ProfileSkillEntry[];
  aside?: ReactNode;
  onChange: ChangeHandler;
}) {
  const [entries, setEntries] = useState(defaultValue);
  const [focusId, setFocusId] = useState<string | null>(null);

  const commit = (next: ProfileSkillEntry[]) => {
    setEntries(next);
    onChange('aboutSkills', next);
  };
  const update = (id: string, patch: Partial<ProfileSkillEntry>) =>
    commit(entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  const add = () => {
    const entry = createEmptyAboutSkillEntry(entries.length);
    setFocusId(entry.id);
    commit([...entries, entry]);
  };

  return (
    <section className={STUDIO_BLOCK_CLASS} aria-label="Skills">
      <div className="min-w-0">
        <StudioSectionHeader label="Skills">
          <StudioIconAction icon="add" label="Add skill" onClick={add} disabled={entries.length >= MAX_ABOUT_SKILLS} />
          {aside}
        </StudioSectionHeader>
        {entries.length === 0 ? (
          <p className={EMPTY_CLASS}>No skill yet</p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
            {entries.map((entry) => (
              <li key={entry.id} className={`group/row flex items-start gap-2 py-4 ${ROW_RULE}`}>
                <div className="min-w-0 flex-1">
                  <StudioUnderline quiet>
                    <input
                      type="text"
                      value={entry.title}
                      maxLength={MAX_ABOUT_SKILL_TITLE}
                      placeholder="Skill"
                      aria-label="Skill title"
                      autoFocus={entry.id === focusId}
                      onChange={(event) => update(entry.id, { title: event.currentTarget.value })}
                      className={`${STUDIO_BARE_INPUT_CLASS} ${VALUE_CLASS}`}
                    />
                  </StudioUnderline>
                  <StudioUnderline quiet className="mt-1">
                    <textarea
                      value={entry.description}
                      maxLength={MAX_ABOUT_SKILL_DESCRIPTION}
                      rows={1}
                      placeholder="A short line of context"
                      aria-label="Skill description"
                      onChange={(event) => update(entry.id, { description: event.currentTarget.value })}
                      className={`${STUDIO_BARE_INPUT_CLASS} resize-none leading-relaxed [field-sizing:content] ${SECONDARY_CLASS}`}
                    />
                  </StudioUnderline>
                </div>
                <StudioRemoveButton
                  label="Remove skill"
                  onClick={() => commit(entries.filter((item) => item.id !== entry.id))}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
});

type ListRow = { id: string; value: string };
let listRowSeq = 0;
const nextListRowId = () => `row-${++listRowSeq}`;
const toRows = (values: string[]): ListRow[] => values.map((value) => ({ id: nextListRowId(), value }));

const StringListColumn = memo(function StringListColumn({
  name,
  label,
  defaultValue,
  maxItems,
  placeholder,
  aside,
  onChange,
}: {
  name: ListKey;
  label: string;
  defaultValue: string[];
  maxItems: number;
  placeholder: string;
  aside?: ReactNode;
  onChange: ChangeHandler;
}) {
  const [rows, setRows] = useState(() => toRows(defaultValue));
  const [focusId, setFocusId] = useState<string | null>(null);

  const commit = (next: ListRow[]) => {
    setRows(next);
    onChange(name, next.map((row) => row.value));
  };
  const add = () => {
    const id = nextListRowId();
    setFocusId(id);
    commit([...rows, { id, value: '' }]);
  };

  return (
    <div className="min-w-0">
      <StudioSectionHeader label={label}>
        <StudioIconAction icon="add" label={`Add ${label.toLowerCase()}`} onClick={add} disabled={rows.length >= maxItems} />
        {aside}
      </StudioSectionHeader>
      {rows.length === 0 ? (
        <p className={EMPTY_CLASS}>Nothing yet</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id} className={`group/row flex items-center gap-2 py-3 ${ROW_RULE}`}>
              <StudioUnderline quiet className="flex-1">
                <input
                  type="text"
                  value={row.value}
                  placeholder={placeholder}
                  aria-label={label}
                  autoFocus={row.id === focusId}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    commit(rows.map((item) => (item.id === row.id ? { ...item, value } : item)));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      if (rows.length < maxItems) add();
                    }
                  }}
                  className={`${STUDIO_BARE_INPUT_CLASS} ${VALUE_CLASS}`}
                />
              </StudioUnderline>
              <StudioRemoveButton
                label={`Remove ${label} item`}
                onClick={() => commit(rows.filter((item) => item.id !== row.id))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export function PortfolioAboutStudio({
  initial,
  hideProviderFields,
  visibility,
  onVisibilityChange,
  onSave,
}: VisibilityProps & {
  initial: PortfolioAboutDraft;
  hideProviderFields: boolean;
  onSave: (draft: PortfolioAboutDraft) => Promise<void>;
}) {
  const studio = useInlineStudio({ initial, onSave, signature: aboutSignature });
  const { baseline, change, commit } = studio;
  const visibilityProps = { visibility, onVisibilityChange };

  return (
    <>
      <div key={studio.revision}>
        <section className={STUDIO_BLOCK_CLASS} aria-label="Profile">
          {!hideProviderFields ? (
            <div className="grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-[minmax(0,1fr)_11rem]">
              <SpecialtyField
                defaultSpecialties={baseline.specialties}
                defaultTags={baseline.specialtyTags}
                onChange={change}
              />
              <ExperienceField
                defaultValue={baseline.yearsOfExperience}
                onChange={change}
                onCommit={commit}
                aside={<VisibilityControl field="yearsOfExperience" {...visibilityProps} />}
              />
            </div>
          ) : null}
          <LanguagesField
            defaultValue={baseline.languages}
            onChange={change}
            aside={<VisibilityControl field="spokenLanguages" {...visibilityProps} />}
          />
        </section>

        <EducationSection
          defaultValue={baseline.aboutEducation}
          onChange={change}
          aside={<VisibilityControl field="aboutEducation" {...visibilityProps} />}
        />

        <SkillsSection
          defaultValue={baseline.aboutSkills}
          onChange={change}
          aside={<VisibilityControl field="aboutSkills" {...visibilityProps} />}
        />

        <section className={`${STUDIO_BLOCK_CLASS} sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3`} aria-label="Strengths, tools and interests">
          <StringListColumn
            name="aboutStrengths"
            label="Strengths"
            defaultValue={baseline.aboutStrengths}
            maxItems={12}
            placeholder="Add a strength"
            onChange={change}
            aside={<VisibilityControl field="aboutStrengths" {...visibilityProps} />}
          />
          <StringListColumn
            name="aboutSystemsTools"
            label="Systems & Tools"
            defaultValue={baseline.aboutSystemsTools}
            maxItems={16}
            placeholder="Add a tool"
            onChange={change}
            aside={<VisibilityControl field="aboutSystemsTools" {...visibilityProps} />}
          />
          <StringListColumn
            name="aboutInterests"
            label="Interests"
            defaultValue={baseline.aboutInterests}
            maxItems={12}
            placeholder="Add an interest"
            onChange={change}
            aside={<VisibilityControl field="aboutInterests" {...visibilityProps} />}
          />
        </section>
      </div>

      <StudioSaveChrome studio={studio} />
    </>
  );
}
