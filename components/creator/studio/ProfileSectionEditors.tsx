'use client';

import { useId, useState, type ReactNode } from 'react';
import { useFieldArray, useForm, useWatch, type FieldPath, type UseFormReturn } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { getApiErrorMessage } from '@/lib/api-error';
import { CREATOR_GENDER_VALUES } from '@/lib/creator-gender';
import { NATIONALITY_SELECT_OPTIONS } from '@/lib/countries';
import { normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { dedupeSpokenLanguageEntries } from '@/lib/spoken-languages';
import { toStoredPhoneNumber } from '@/lib/phone';
import { TYPICAL_RESPONSE_TIME_OPTIONS } from '@/lib/typical-response-time';
import {
  defaultSchedule,
  formatAvailabilityHours,
  parseAvailabilityHours,
  type AvailabilitySchedule,
} from '@/lib/availabilityHours';
import type { ContactVisibilitySettings } from '@/lib/contact-visibility';
import type { CreatorProfileUpdateBody } from '@/types/profile';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { AvailabilityHoursInput } from '@/components/ui/AvailabilityHoursInput';
import { ProfileAppRoleField } from '@/components/creator/studio/ProfileAppRoleField';
import { ProfileStrengthsField } from '@/components/creator/studio/ProfileStrengthsField';
import { ProfileLanguagesField } from '@/components/creator/studio/ProfileLanguagesField';
import { ProfileLinksField } from '@/components/creator/studio/ProfileLinksField';
import { ProfileFaqField } from '@/components/creator/studio/ProfileFaqField';
import { ProfileSectionDrawer } from '@/components/creator/studio/ProfileSectionDrawer';
import {
  createEmptyContactEntry,
  deriveProfileLinkLabel,
  profileSchema,
  syncContactLegacyFields,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import type { ProfileSectionId } from '@/components/creator/studio/profile-section-nav';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/** The sections My Profile edits one at a time, each in its own drawer. */
export type ProfileDrawerSectionId = Extract<
  ProfileSectionId,
  'about' | 'myRole' | 'strengths' | 'tools' | 'links' | 'contact' | 'faq'
>;

const PROFILE_DRAWER_SECTIONS: readonly ProfileDrawerSectionId[] = [
  'about',
  'myRole',
  'strengths',
  'tools',
  'links',
  'contact',
  'faq',
];

export function isProfileDrawerSection(id: ProfileSectionId): id is ProfileDrawerSectionId {
  return (PROFILE_DRAWER_SECTIONS as readonly string[]).includes(id);
}

/** Same cap as the profile schema and the API (`MAX_CONTACT_ENTRIES`). */
const MAX_CONTACT_ENTRIES = 8;

/**
 * The form fields each drawer owns. Validation is scoped to them: a legacy value somewhere else in the
 * profile must never block saving, say, the FAQ.
 */
const SECTION_FORM_KEYS: Record<ProfileDrawerSectionId, readonly (keyof ProfileFormValues)[]> = {
  about: ['yearsOfExperience', 'gender', 'nationality', 'spokenLanguages', 'availabilityHours'],
  myRole: ['appRole'],
  strengths: ['stackItems'],
  tools: ['strengthsTools'],
  links: ['profileLinks'],
  contact: ['contactAddresses', 'contactPhones', 'contactEmails', 'contactAddress', 'contactPhone', 'contactEmail'],
  faq: ['faqItems'],
};

/**
 * The API fields each drawer writes. PUT /api/creator/profile is a patch — the service only touches the
 * fields that arrive non-null — so a section save sends these keys and nothing else: the rest of the
 * profile is left exactly as stored, and cannot be wiped or re-validated by an unrelated edit.
 */
export const SECTION_BODY_KEYS: Record<ProfileDrawerSectionId, readonly (keyof CreatorProfileUpdateBody)[]> = {
  about: ['yearsOfExperience', 'gender', 'nationality', 'spokenLanguages', 'availabilityHours', 'typicalResponseTime'],
  myRole: ['appRole'],
  strengths: ['profileStack'],
  tools: ['strengthsToolsMastered'],
  links: ['profileLinks'],
  contact: ['contactAddresses', 'contactPhones', 'contactEmails', 'contactAddress', 'contactPhone', 'contactEmail'],
  faq: ['faqItems'],
};

/**
 * The visibility settings a section covers. Visibility is no longer edited in the drawers (each block
 * of the profile has its own picker); the keys still scope what "unchanged" means for a drawer.
 */
const SECTION_VISIBILITY_KEYS: Record<ProfileDrawerSectionId, readonly (keyof ContactVisibilitySettings)[]> = {
  about: ['yearsOfExperience', 'gender', 'location', 'spokenLanguages', 'availability', 'responseTime'],
  myRole: [],
  strengths: ['profileStack'],
  tools: ['strengthsTools'],
  links: ['links'],
  contact: ['email', 'phone', 'address'],
  faq: ['faq'],
};

const DRAWER_COPY: Record<ProfileDrawerSectionId, { title: string; description: string }> = {
  about: {
    title: msg('Edit general info'),
    description: msg('Who sees each detail is set on your profile, next to it.'),
  },
  myRole: { title: msg('Edit my role'), description: msg('Your role tailors the app and the sections of your profile.') },
  strengths: { title: msg('Edit stack'), description: msg('Technologies you work with — up to 12, with their logo.') },
  tools: { title: msg('Edit tools'), description: msg('Software you master, grouped by specialty — up to 12.') },
  links: { title: msg('Edit links'), description: msg('Your website and socials. The first link is your main button.') },
  contact: { title: msg('Edit contact'), description: msg('Email, phone and address. Who sees them is set on your profile.') },
  faq: { title: msg('Edit FAQ'), description: msg('Answer the questions clients ask before ordering.') },
};

/** Drop the empty rows a drawer leaves behind (an added but unfilled question, link or phone). */
function cleanSectionValues(section: ProfileDrawerSectionId, values: ProfileFormValues): Partial<ProfileFormValues> {
  switch (section) {
    case 'about':
      return {
        yearsOfExperience: values.yearsOfExperience ?? null,
        gender: values.gender ?? '',
        nationality: values.nationality ?? '',
        spokenLanguages: dedupeSpokenLanguageEntries(
          values.spokenLanguages.filter((item) => item.value.trim().length > 0)
        ),
        availabilityHours: values.availabilityHours?.trim() ?? '',
      };
    case 'myRole':
      return { appRole: normalizeCreatorAppRole(values.appRole) };
    case 'strengths':
      return {
        stackItems: values.stackItems
          .filter((item) => item.value.trim().length > 0)
          .map((item) => ({ ...item, value: item.value.trim() })),
      };
    case 'tools':
      return {
        strengthsTools: values.strengthsTools
          .filter((item) => item.value.trim().length > 0)
          .map((item) => ({ ...item, value: item.value.trim() })),
      };
    case 'links':
      return {
        profileLinks: values.profileLinks
          .filter((link) => link.url.trim().length > 0)
          .map((link, index) => ({
            ...link,
            url: link.url.trim(),
            /* The drawer edits URLs only; the label follows the URL, as the inline links editor did. */
            label: deriveProfileLinkLabel(link.url),
            type: link.type || 'CUSTOM',
            sortOrder: index,
          })),
      };
    case 'contact': {
      const keep = <T extends { value: string; sortOrder: number }>(entries: T[], phone = false) =>
        entries
          .filter((entry) => (phone ? toStoredPhoneNumber(entry.value) : entry.value.trim()).length > 0)
          .map((entry, index) => ({ ...entry, value: entry.value.trim(), sortOrder: index }));
      const contactAddresses = keep(values.contactAddresses);
      const contactPhones = keep(values.contactPhones, true);
      const contactEmails = keep(values.contactEmails);
      return {
        contactAddresses,
        contactPhones,
        contactEmails,
        ...syncContactLegacyFields({ contactAddresses, contactPhones, contactEmails }),
      };
    }
    case 'faq':
      return {
        faqItems: values.faqItems
          .filter((item) => item.question.trim().length > 0 || item.answer.trim().length > 0)
          .map((item, index) => ({
            ...item,
            question: item.question.trim(),
            answer: item.answer.trim(),
            sortOrder: index,
          })),
      };
  }
}

/** What "unchanged" means for a drawer: its cleaned values, its visibility switches, its extras. */
function sectionSignature(
  section: ProfileDrawerSectionId,
  values: ProfileFormValues,
  visibility: ContactVisibilitySettings,
  responseTime: string
): string {
  const cleaned = cleanSectionValues(section, values);
  const comparable =
    section === 'contact'
      ? {
          ...cleaned,
          contactPhones: (cleaned.contactPhones ?? []).map((entry) => toStoredPhoneNumber(entry.value)),
        }
      : cleaned;
  return JSON.stringify({
    values: comparable,
    visibility: SECTION_VISIBILITY_KEYS[section].map((key) => visibility[key]),
    responseTime: section === 'about' ? responseTime : '',
  });
}

export type ProfileSectionSaveInput = {
  section: ProfileDrawerSectionId;
  /** The whole profile as the drawer leaves it: the saved values with this section's edits applied. */
  values: ProfileFormValues;
  /** Saved visibility with this section's switches applied. */
  visibility: ContactVisibilitySettings;
  typicalResponseTime: string;
};

type ProfileSectionEditorDrawerProps = {
  section: ProfileDrawerSectionId;
  initialValues: ProfileFormValues;
  initialVisibility: ContactVisibilitySettings;
  initialResponseTime: string;
  timezoneId: string;
  /** Service-provider details (availability hours, response time) — hidden for recruiters. */
  showProviderFields: boolean;
  onSave: (input: ProfileSectionSaveInput) => Promise<void>;
  onClose: () => void;
};

/**
 * A section's drawer with its own form. It starts from the saved profile every time it opens (the
 * parent mounts it per opening), so its dirty state is this section's alone, Cancel simply drops the
 * form, and nothing typed here touches the read view behind it until the save succeeds.
 */
export function ProfileSectionEditorDrawer({
  section,
  initialValues,
  initialVisibility,
  initialResponseTime,
  timezoneId,
  showProviderFields,
  onSave,
  onClose,
}: ProfileSectionEditorDrawerProps) {
  const t = useT();
  const form = useForm<ProfileFormValues>({ defaultValues: initialValues });
  const watched = useWatch({ control: form.control }) as ProfileFormValues;
  /* Saved as it is: the drawers no longer change visibility. */
  const visibility = initialVisibility;
  const [responseTime, setResponseTime] = useState(initialResponseTime);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialSignature] = useState(() =>
    sectionSignature(section, initialValues, initialVisibility, initialResponseTime)
  );

  const current = { ...initialValues, ...watched };
  const dirty = sectionSignature(section, current, visibility, responseTime) !== initialSignature;

  const save = async () => {
    if (saving || !dirty) return;
    setError(null);
    form.clearErrors();
    const raw = form.getValues();
    const cleaned = cleanSectionValues(section, raw);
    const next = { ...raw, ...cleaned } as ProfileFormValues;

    const parsed = profileSchema.safeParse(next);
    if (!parsed.success) {
      const owned = SECTION_FORM_KEYS[section] as readonly string[];
      const issues = parsed.error.issues.filter((issue) => owned.includes(String(issue.path[0])));
      if (issues.length > 0) {
        /* Show the rows exactly as they would be saved, so each error path points at its row. */
        for (const [key, value] of Object.entries(cleaned)) {
          form.setValue(key as keyof ProfileFormValues, value as never, { shouldDirty: false });
        }
        for (const issue of issues) {
          form.setError(issue.path.join('.') as FieldPath<ProfileFormValues>, {
            type: 'manual',
            message: issue.message,
          });
        }
        setError(issues[0].message || t('Check the highlighted fields.'));
        return;
      }
    }

    setSaving(true);
    try {
      await onSave({ section, values: next, visibility, typicalResponseTime: responseTime });
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to save this section.')));
    } finally {
      setSaving(false);
    }
  };

  const copy = DRAWER_COPY[section];

  return (
    <ProfileSectionDrawer
      open
      title={t(copy.title)}
      description={t(copy.description)}
      dirty={dirty}
      saving={saving}
      error={error}
      onSave={() => void save()}
      onClose={onClose}
    >
      {section === 'about' ? (
        <GeneralInfoEditor
          form={form}
          values={current}
          responseTime={responseTime}
          onResponseTimeChange={setResponseTime}
          timezoneId={timezoneId}
          showProviderFields={showProviderFields}
        />
      ) : section === 'myRole' ? (
        <ProfileAppRoleField
          value={normalizeCreatorAppRole(current.appRole)}
          disabled={saving}
          onChange={(role) => form.setValue('appRole', role, { shouldDirty: true })}
        />
      ) : section === 'strengths' || section === 'tools' ? (
        <ProfileStrengthsField
          control={form.control}
          setValue={form.setValue}
          allowedSpecialties={current.specialties ?? []}
          mode={section === 'strengths' ? 'stack' : 'tools'}
        />
      ) : section === 'links' ? (
        <LinksEditor form={form} />
      ) : section === 'faq' ? (
        <FaqEditor form={form} />
      ) : (
        <ContactEditor
          form={form}
          values={current}
          lockPrimaryEmail={Boolean(initialValues.contactEmails[0]?.value.trim())}
        />
      )}
    </ProfileSectionDrawer>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Section bodies. They reuse the studio's field components; inside the drawer every field takes one
 * News style (profile-drawer.css): filled in the module tone, no outline, an ink ring on focus.
 * ---------------------------------------------------------------------------------------------- */

/** A field label: 14px semibold ink, 8px above its field. */
const FIELD_LABEL = 'mb-2 block text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]';
/** Our own fields (the reused components bring theirs): 48px, filled, 15px. */
const FIELD = 'h-12 w-full px-4 text-[15px]';

/**
 * One group of a drawer, as the profile names its sections: the small-caps kicker with the square
 * marker (+ an aside on the right, e.g. a counter), an optional one-line hint, then the fields.
 * Groups are set apart by space alone.
 */
function DrawerGroup({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div>
        <div className="flex min-h-6 items-center justify-between gap-3">
          <h3 id={id} className="gn-kicker flex items-center gap-2.5">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-[color:var(--gn-ink)]" />
            {title}
          </h3>
          {aside}
        </div>
        {description ? <p className="mt-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** A small counter for a group's aside ("3 / 20"). */
function GroupCount({ count, limit }: { count: number; limit: number }) {
  return (
    <span className="text-[13px] tabular-nums text-[color:var(--gn-ink2)]">
      {count} / {limit}
    </span>
  );
}

/** An outlined "+ Add …" pill, the drawers' one way to add a row. */
const ADD_PILL =
  'inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] dark:shadow-[inset_0_0_0_1px_#536471]';

/**
 * General Info without the identity fields: name, bio, specialties, location and status are edited from
 * the profile header ("Edit intro"), username and email from Settings › Account. What remains is the
 * factual block visitors read under General Info, in three groups — about you, languages, availability
 * — in the order the profile shows them.
 */
function GeneralInfoEditor({
  form,
  values,
  responseTime,
  onResponseTimeChange,
  timezoneId,
  showProviderFields,
}: {
  form: UseFormReturn<ProfileFormValues>;
  values: ProfileFormValues;
  responseTime: string;
  onResponseTimeChange: (value: string) => void;
  timezoneId: string;
  showProviderFields: boolean;
}) {
  const t = useT();
  const id = useId();
  const [schedule, setSchedule] = useState<AvailabilitySchedule | null>(() =>
    values.availabilityHours?.trim() ? parseAvailabilityHours(values.availabilityHours) : null
  );
  const languageCount = values.spokenLanguages.filter((item) => item.value.trim()).length;

  const applySchedule = (next: AvailabilitySchedule | null) => {
    setSchedule(next);
    form.setValue('availabilityHours', next ? formatAvailabilityHours(next, timezoneId) : '', {
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-10">
      <DrawerGroup title={t('About you')}>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-years`} className={FIELD_LABEL}>
              {t('Years of experience')}
            </label>
            {/* The unit sits inside the field, so the number reads as "8 years". */}
            <div className="relative">
              <input
                id={`${id}-years`}
                type="number"
                inputMode="numeric"
                min={0}
                max={80}
                placeholder="0"
                className={`${FIELD} pr-16 tabular-nums`}
                {...form.register('yearsOfExperience', {
                  setValueAs: (raw) => {
                    if (raw === '' || raw == null) return null;
                    const parsed = Number(raw);
                    return Number.isNaN(parsed) ? null : Math.max(0, Math.min(80, Math.round(parsed)));
                  },
                })}
              />
              <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[color:var(--gn-ink2)]">
                {t('years')}
              </span>
            </div>
          </div>
          <div>
            <label htmlFor={`${id}-gender`} className={FIELD_LABEL}>
              {t('Gender')}
            </label>
            <select id={`${id}-gender`} className={FIELD} {...form.register('gender')}>
              <option value="">{t('Not specified')}</option>
              {CREATOR_GENDER_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(value)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-nationality`} className={FIELD_LABEL}>
              {t('Nationality')}
            </label>
            <select id={`${id}-nationality`} className={FIELD} {...form.register('nationality')}>
              <option value="">{t('Not specified')}</option>
              {NATIONALITY_SELECT_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </DrawerGroup>

      <DrawerGroup
        title={t('Languages')}
        description={t('The languages you work in, with your level.')}
        aside={<GroupCount count={languageCount} limit={20} />}
      >
        <ProfileLanguagesField control={form.control} setValue={form.setValue} variant="drawer" />
      </DrawerGroup>

      {showProviderFields ? (
        <DrawerGroup title={t('Availability')} description={t('When clients can expect you to work, and to answer.')}>
          <div>
            <label htmlFor={`${id}-response`} className={FIELD_LABEL}>
              {t('Typical response time')}
            </label>
            <select
              id={`${id}-response`}
              className={FIELD}
              value={responseTime}
              onChange={(event) => onResponseTimeChange(event.target.value)}
            >
              <option value="">{t('Not set')}</option>
              {TYPICAL_RESPONSE_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className={`${FIELD_LABEL} !mb-0`}>{t('Working hours')}</p>
              {schedule ? (
                <button
                  type="button"
                  onClick={() => applySchedule(null)}
                  className="-mr-2 inline-flex h-8 items-center rounded-full px-2 text-[13px] font-semibold text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[#F4212E] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                >
                  {t('Remove')}
                </button>
              ) : null}
            </div>
            {schedule ? (
              <div className="rounded-xl bg-[color:var(--gn-surface)] p-4">
                <AvailabilityHoursInput value={schedule} onChange={applySchedule} timezoneId={timezoneId || null} />
              </div>
            ) : (
              <button type="button" onClick={() => applySchedule(defaultSchedule())} className={ADD_PILL}>
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                {t('Add working hours')}
              </button>
            )}
          </div>
        </DrawerGroup>
      ) : null}
    </div>
  );
}

function LinksEditor({ form }: { form: UseFormReturn<ProfileFormValues> }) {
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'profileLinks' });
  return (
    <ProfileLinksField
      control={form.control}
      fields={fields}
      append={append}
      remove={remove}
      move={move}
      register={form.register}
      errors={form.formState.errors.profileLinks}
    />
  );
}

function FaqEditor({ form }: { form: UseFormReturn<ProfileFormValues> }) {
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'faqItems' });
  return (
    <ProfileFaqField
      control={form.control}
      fields={fields}
      append={append}
      remove={remove}
      move={move}
      register={form.register}
    />
  );
}

type ContactListName = 'contactEmails' | 'contactPhones' | 'contactAddresses';

const CONTACT_LIST_COPY: Record<
  ContactListName,
  {
    title: string;
    noun: string;
    plural: string;
    addFirst: string;
    placeholder: string;
  }
> = {
  contactEmails: {
    title: msg('Email'),
    noun: 'email',
    plural: 'emails',
    addFirst: 'Add an email',
    placeholder: msg('contact@yourbrand.com'),
  },
  contactPhones: {
    title: msg('Phone'),
    noun: 'phone number',
    plural: 'phone numbers',
    addFirst: 'Add a phone number',
    placeholder: '',
  },
  contactAddresses: {
    title: msg('Address'),
    noun: 'address',
    plural: 'addresses',
    addFirst: 'Add an address',
    placeholder: msg("e.g. 12 Rue de l'Innovation, 75001 Paris"),
  },
};

function ContactEditor({
  form,
  values,
  lockPrimaryEmail,
}: {
  form: UseFormReturn<ProfileFormValues>;
  values: ProfileFormValues;
  lockPrimaryEmail: boolean;
}) {
  return (
    <div className="space-y-10">
      {(['contactEmails', 'contactPhones', 'contactAddresses'] as const).map((name) => (
        <ContactListField
          key={name}
          name={name}
          form={form}
          values={values[name]}
          lockFirst={name === 'contactEmails' && lockPrimaryEmail}
        />
      ))}
    </div>
  );
}

/** One kind of contact detail: a list of entries, each removable, and "+ Add" under them. */
function ContactListField({
  name,
  form,
  values,
  lockFirst,
}: {
  name: ContactListName;
  form: UseFormReturn<ProfileFormValues>;
  values: ProfileFormValues[ContactListName];
  lockFirst: boolean;
}) {
  const t = useT();
  const id = useId();
  const copy = CONTACT_LIST_COPY[name];
  const { fields, append, remove } = useFieldArray({ control: form.control, name });
  const errors = form.formState.errors[name];

  return (
    <DrawerGroup
      title={t(copy.title)}
      aside={fields.length > 0 ? <GroupCount count={fields.length} limit={MAX_CONTACT_ENTRIES} /> : null}
    >
      {fields.length > 0 ? (
        <ul className="space-y-3">
          {fields.map((field, index) => {
            const locked = lockFirst && index === 0;
            const inputId = `${id}-${field.id}`;
            const message = Array.isArray(errors) ? errors[index]?.value?.message : undefined;
            return (
              <li key={field.id}>
                <label htmlFor={inputId} className="sr-only">
                  {t(copy.title)} {index + 1}
                </label>
                {locked ? (
                  <div className="rounded-xl bg-[color:var(--gn-surface)] px-4 py-3">
                    <p className="truncate text-[15px] text-[color:var(--gn-ink)]">{values[index]?.value}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-[color:var(--gn-ink2)]">
                      <FontAwesomeIcon icon={faLock} className="h-2.5 w-2.5" />
                      {t('Primary · account email')}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="min-w-0 flex-1">
                      {name === 'contactPhones' ? (
                        <PhoneInput
                          id={inputId}
                          value={values[index]?.value ?? ''}
                          onChange={(next) =>
                            form.setValue(`contactPhones.${index}.value`, next, { shouldDirty: true })
                          }
                        />
                      ) : (
                        <input
                          id={inputId}
                          type={name === 'contactEmails' ? 'email' : 'text'}
                          inputMode={name === 'contactEmails' ? 'email' : undefined}
                          autoComplete={name === 'contactEmails' ? 'email' : 'street-address'}
                          placeholder={t(copy.placeholder)}
                          aria-invalid={message ? true : undefined}
                          className={FIELD}
                          {...form.register(`${name}.${index}.value`)}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove ${copy.noun} ${index + 1}`}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                    >
                      <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {message ? <p className="mt-1.5 text-[13px] font-medium text-[#F4212E]">{message}</p> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      {fields.length < MAX_CONTACT_ENTRIES ? (
        <button
          type="button"
          onClick={() => append(createEmptyContactEntry(fields.length))}
          className={ADD_PILL}
        >
          <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
          {fields.length === 0 ? copy.addFirst : `Add another ${copy.noun}`}
        </button>
      ) : null}
    </DrawerGroup>
  );
}
