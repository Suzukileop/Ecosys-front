'use client';

import {
  Controller,
  useFieldArray,
  type Control,
  type FieldArrayWithId,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import {
  createEmptyProfileService,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileFormLabelClass,
  profileSectionEmptyClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionLimitUpgradeHint } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';

export const MAX_SERVICES = 3;
const MAX_TASKS_PER_SERVICE = 12;

type ProfileServicesFieldProps = {
  control: Control<ProfileFormValues>;
  fields: FieldArrayWithId<ProfileFormValues, 'serviceOffers', 'id'>[];
  append: (value: ReturnType<typeof createEmptyProfileService>) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  readOnly?: boolean;
  values?: ProfileFormValues['serviceOffers'];
};

function isFreePrice(cents: number | null | undefined): boolean {
  return cents != null && !Number.isNaN(cents) && cents === 0;
}

function formatPrice(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '';
  if (cents === 0) return 'Free';
  return `${(cents / 100).toFixed(2)} €`;
}

function eurosInputFromCents(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents) || cents === 0) return '';
  const euros = cents / 100;
  if (!Number.isFinite(euros)) return '';
  // Avoid trailing zeros for whole euros while keeping decimals when needed.
  return String(Number(euros.toFixed(2)));
}

function centsFromEurosInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}

function ServiceOfferCard({
  control,
  register,
  fieldId,
  index,
  total,
  move,
  remove,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  fieldId: string;
  index: number;
  total: number;
  move: (from: number, to: number) => void;
  remove: (index: number) => void;
}) {
  const {
    fields: taskFields,
    append: appendTask,
    remove: removeTask,
  } = useFieldArray({
    control,
    name: `serviceOffers.${index}.tasks`,
  });

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          Service {index + 1}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => move(index, index - 1)}
            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => move(index, index + 1)}
            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => remove(index)}
            className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 dark:border-red-500/30 dark:text-red-400"
          >
            Remove
          </button>
        </div>
      </div>

      <div>
        <label htmlFor={`service-title-${fieldId}`} className={profileFormLabelClass}>
          Title
        </label>
        <input
          id={`service-title-${fieldId}`}
          type="text"
          className={profileFormInputClass}
          {...register(`serviceOffers.${index}.title`)}
        />
      </div>

      <div>
        <label htmlFor={`service-desc-${fieldId}`} className={profileFormLabelClass}>
          Description
        </label>
        <textarea
          id={`service-desc-${fieldId}`}
          rows={3}
          className={profileFormInputClass}
          {...register(`serviceOffers.${index}.description`)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`service-price-${fieldId}`} className={profileFormLabelClass}>
            Base price (€)
          </label>
          <Controller
            control={control}
            name={`serviceOffers.${index}.basePriceCents`}
            render={({ field }) => {
              const free = isFreePrice(field.value);
              return (
                <div className="flex items-center gap-2">
                  <input
                    id={`service-price-${fieldId}`}
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${profileFormInputClass} min-w-0 flex-1`}
                    value={eurosInputFromCents(field.value)}
                    onChange={(event) => {
                      field.onChange(centsFromEurosInput(event.target.value));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    placeholder={free ? 'Free' : 'e.g. 50'}
                    disabled={free}
                  />
                  <button
                    type="button"
                    onClick={() => field.onChange(free ? null : 0)}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
                      free
                        ? 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                    }`}
                  >
                    Free
                  </button>
                </div>
              );
            }}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Ex. 50 = 50,00 €, or mark as Free. Empty = price on request.
          </p>
        </div>
        <div>
          <label htmlFor={`service-deadline-${fieldId}`} className={profileFormLabelClass}>
            Typical deadline
          </label>
          <input
            id={`service-deadline-${fieldId}`}
            type="text"
            placeholder="e.g. 3–5 days"
            className={profileFormInputClass}
            {...register(`serviceOffers.${index}.deadline`)}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className={profileFormLabelClass}>Tasks</label>
          <button
            type="button"
            disabled={taskFields.length >= MAX_TASKS_PER_SERVICE}
            onClick={() => appendTask({ value: '' })}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400"
          >
            + Add task
          </button>
        </div>
        {taskFields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-3 text-xs text-neutral-500 dark:border-neutral-700">
            No tasks yet — e.g. Concept & moodboard, Full design system, Handoff to developers
          </p>
        ) : (
          <div className="space-y-2">
            {taskFields.map((taskField, taskIndex) => (
              <div key={taskField.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Task ${taskIndex + 1}`}
                  className={`${profileFormInputClass} mt-0 min-w-0 flex-1`}
                  {...register(`serviceOffers.${index}.tasks.${taskIndex}.value`)}
                />
                <button
                  type="button"
                  onClick={() => removeTask(taskIndex)}
                  className="shrink-0 text-sm font-medium text-red-600 dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProfileServicesField({
  control,
  fields,
  append,
  remove,
  move,
  register,
  readOnly = false,
  values = [],
}: ProfileServicesFieldProps) {
  if (readOnly) {
    const filled = values.filter((item) => item.title.trim());
    if (filled.length === 0) {
      return <p className={profileSectionEmptyClass}>No services added yet.</p>;
    }
    return (
      <div className="space-y-3">
        {filled.map((service) => {
          const tasks = (service.tasks ?? []).map((item) => item.value.trim()).filter(Boolean);
          return (
            <div
              key={service.id}
              className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50"
            >
              <p className="font-semibold text-neutral-900 dark:text-white">{service.title}</p>
              {service.description?.trim() ? (
                <p className="mt-2 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                  {service.description}
                </p>
              ) : null}
              {tasks.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
                  {tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                {service.basePriceCents != null ? (
                  <span>
                    {isFreePrice(service.basePriceCents)
                      ? 'Free'
                      : `From ${formatPrice(service.basePriceCents)}`}
                  </span>
                ) : null}
                {service.deadline?.trim() ? <span>Deadline: {service.deadline}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProfileSectionLimitUpgradeHint limit={MAX_SERVICES} unit="services" />

      {fields.length === 0 ? (
        <p className={profileSectionEmptyClass}>No services added yet.</p>
      ) : (
        fields.map((field, index) => (
          <ServiceOfferCard
            key={field.id}
            control={control}
            register={register}
            fieldId={field.id}
            index={index}
            total={fields.length}
            move={move}
            remove={remove}
          />
        ))
      )}

      {fields.length < MAX_SERVICES ? (
        <button
          type="button"
          onClick={() => append(createEmptyProfileService(fields.length))}
          className="rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Add service
        </button>
      ) : null}
    </div>
  );
}
