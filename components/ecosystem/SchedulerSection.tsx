'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getScheduledConfig, updateScheduledConfig } from '@/lib/ecosystem';
import type { NicheRequestResponse, PublicationSlotDto } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EcosystemPlatformBadges } from '@/components/ecosystem/EcosystemPlatformBadges';

const WEEK_DAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const DEFAULT_TIME_PALETTE = [
  '08:00', '12:00', '18:00', '09:00', '14:00', '21:00',
  '10:00', '16:00', '20:00', '11:00', '15:00', '19:00', '13:00',
];

function dayLabel(day: number): string {
  return WEEK_DAYS.find((d) => d.value === day)?.label ?? 'Day';
}

function normalizeSlotsFromApi(raw: PublicationSlotDto[] | undefined | null, nb: number): PublicationSlotDto[] {
  if (!raw?.length) return [];
  const sorted = [...raw].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time)
  );
  return sorted.slice(0, nb).map((s) => ({ dayOfWeek: s.dayOfWeek, time: s.time }));
}

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  time: z.string().regex(TIME_REGEX, 'Invalid time (HH:mm).'),
});

function buildWeekSummary(slots: PublicationSlotDto[] | undefined) {
  const list = slots ?? [];
  return WEEK_DAYS.map(({ value: day, label }) => {
    const entries = list
      .filter((s) => s.dayOfWeek === day)
      .map((s) => s.time)
      .sort((a, b) => a.localeCompare(b));
    return { day, label, entries };
  });
}

function countOnDay(slots: PublicationSlotDto[], day: number): number {
  return slots.filter((s) => s.dayOfWeek === day).length;
}

function suggestNewTime(slots: PublicationSlotDto[], day: number, ignoreIndices: Set<number>): string {
  const used = new Set(
    slots
      .map((s, i) => (s.dayOfWeek === day && !ignoreIndices.has(i) ? s.time : null))
      .filter((x): x is string => x != null)
  );
  for (const t of DEFAULT_TIME_PALETTE) {
    if (!used.has(t)) return t;
  }
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      if (!used.has(t)) return t;
    }
  }
  return '09:00';
}

function healDuplicates(slots: PublicationSlotDto[]): PublicationSlotDto[] {
  const seen = new Set<string>();
  const next = slots.map((s) => ({ ...s }));
  for (let i = 0; i < next.length; i++) {
    let key = `${next[i]!.dayOfWeek}|${next[i]!.time}`;
    while (seen.has(key)) {
      const t = suggestNewTime(next, next[i]!.dayOfWeek, new Set([i]));
      next[i] = { dayOfWeek: next[i]!.dayOfWeek, time: t };
      key = `${next[i]!.dayOfWeek}|${next[i]!.time}`;
    }
    seen.add(key);
  }
  return next;
}

function buildSchema(nbPosts: number) {
  return z
    .object({ publicationSlots: z.array(slotSchema) })
    .superRefine((data, ctx) => {
      const n = data.publicationSlots.length;
      if (n < nbPosts) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Add ${nbPosts - n} more slot${nbPosts - n > 1 ? 's' : ''} (${n} of ${nbPosts} scheduled).`,
          path: ['publicationSlots'],
        });
      }
      if (n > nbPosts) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Too many slots (${n}). This niche allows ${nbPosts} post${nbPosts > 1 ? 's' : ''} per week.`,
          path: ['publicationSlots'],
        });
      }
      const seen = new Set<string>();
      data.publicationSlots.forEach((s, i) => {
        const key = `${s.dayOfWeek}|${s.time}`;
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Duplicate slot (same day and time). Change one of them.',
            path: ['publicationSlots', i, 'time'],
          });
        }
        seen.add(key);
      });
    });
}

function ProgressDonut({ percent }: { percent: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-[4.5rem] w-[4.5rem] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-orange-100 dark:text-orange-950/60" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[#F97316] transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-neutral-900 dark:text-white">
        {percent}%
      </span>
    </div>
  );
}

function ClockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
  );
}

function SaveIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v6h8M15 3v4h4" />
    </svg>
  );
}

type Props = {
  request: NicheRequestResponse;
  onSaved: () => void;
  actionsLocked?: boolean;
};

export function SchedulerSection({ request, onSaved, actionsLocked = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [draftTime, setDraftTime] = useState('09:00');
  const [draftError, setDraftError] = useState<string | null>(null);
  const nb = request.nbPostsPerWeek;

  const schema = useMemo(() => buildSchema(nb), [nb]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { publicationSlots: [] },
  });

  const applySlots = useCallback(
    (next: PublicationSlotDto[]) => {
      reset({ publicationSlots: healDuplicates(next) });
    },
    [reset]
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const cfg = await getScheduledConfig(request.id);
        if (cancelled) return;
        reset({ publicationSlots: normalizeSlotsFromApi(cfg.publicationSlots, nb) });
        setActiveDay(1);
      } catch (e) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(e, 'Unable to load schedule configuration.'));
          reset({ publicationSlots: [] });
          setActiveDay(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [request.id, nb, reset]);

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await updateScheduledConfig(request.id, {
        nicheRequestId: request.id,
        publicationSlots: data.publicationSlots,
      });
      onSaved();
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Unable to save schedule.'));
    }
  });

  const pubSlotsErr = errors.publicationSlots;
  const slotsError =
    pubSlotsErr &&
    typeof pubSlotsErr === 'object' &&
    'message' in pubSlotsErr &&
    typeof pubSlotsErr.message === 'string'
      ? pubSlotsErr.message
      : null;

  const watchedSlots = watch('publicationSlots');
  const slotCount = watchedSlots?.length ?? 0;
  const missingCount = Math.max(0, nb - slotCount);
  const progressPct = nb > 0 ? Math.min(100, Math.round((slotCount / nb) * 100)) : 0;

  const weekSummary = useMemo(() => buildWeekSummary(watchedSlots), [watchedSlots]);
  const daysWithSlots = useMemo(
    () => weekSummary.filter((d) => d.entries.length > 0).length,
    [weekSummary]
  );

  const indicesForActiveDay = useMemo(() => {
    const slots = watchedSlots ?? [];
    const idx = slots
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => s.dayOfWeek === activeDay)
      .map(({ i }) => i);
    idx.sort((a, b) => slots[a]!.time.localeCompare(slots[b]!.time) || a - b);
    return idx;
  }, [watchedSlots, activeDay]);

  const onThisDay = countOnDay(watchedSlots ?? [], activeDay);
  const canAppendSlot = slotCount < nb;

  const appendSlotForActiveDay = useCallback(() => {
    setDraftError(null);
    const slots = getValues('publicationSlots');
    if (slots.length >= nb) {
      setDraftError(`You cannot exceed ${nb} slot${nb > 1 ? 's' : ''} per week.`);
      return;
    }
    const t = draftTime.trim();
    if (!TIME_REGEX.test(t)) {
      setDraftError('Invalid time (use HH:mm, e.g. 09:00).');
      return;
    }
    if (slots.some((s) => s.dayOfWeek === activeDay && s.time === t)) {
      setDraftError('This time already exists for the selected day.');
      return;
    }
    applySlots([...slots, { dayOfWeek: activeDay, time: t }]);
  }, [activeDay, applySlots, draftTime, getValues, nb]);

  const removeTimeAt = useCallback(
    (flatIndex: number) => {
      applySlots(getValues('publicationSlots').filter((_, i) => i !== flatIndex));
    },
    [applySlots, getValues]
  );

  useEffect(() => {
    setDraftError(null);
  }, [activeDay]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-6 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-48 rounded bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Schedule your posts</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          This niche targets <strong className="text-neutral-800 dark:text-neutral-200">{nb} posts per week</strong>
          — add days and times until the schedule is complete.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-4 dark:border-orange-900/30 dark:from-orange-950/20 dark:to-neutral-900 sm:p-5">
        <div className="flex flex-wrap items-center gap-5">
          <ProgressDonut percent={progressPct} />
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-neutral-900 dark:text-white">
              {slotCount} slot{slotCount !== 1 ? 's' : ''} scheduled
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {missingCount > 0 ? (
                <>
                  <span className="font-medium text-[#EA580C]">{missingCount} remaining</span> out of {nb}
                </>
              ) : (
                <span className="font-medium text-green-700 dark:text-green-400">All slots filled — ready to save</span>
              )}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100 dark:bg-orange-950/50">
              <div
                className="h-full rounded-full bg-[#F97316] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              {slotCount} / {nb}
            </p>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mt-4">
          <ErrorAlert message={loadError} />
        </div>
      )}
      {submitError && (
        <div className="mt-4">
          <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />
        </div>
      )}

      {missingCount > 0 && (
        <div
          className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100"
          role="status"
        >
          <span className="mt-0.5 shrink-0 text-amber-600" aria-hidden>
            ⚠
          </span>
          <p>
            <strong className="font-semibold">Incomplete schedule.</strong> Keep adding slots until you reach{' '}
            {nb} post{nb > 1 ? 's' : ''} per week.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6">
        <fieldset disabled={actionsLocked} className="disabled:opacity-60">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left — weekly overview */}
            <div className="flex flex-col rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/40 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Weekly overview</h3>
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-medium text-orange-800 dark:bg-orange-950/50 dark:text-orange-200">
                  {daysWithSlots} active day{daysWithSlots !== 1 ? 's' : ''}
                </span>
              </div>

              <ul className="mt-4 flex-1 space-y-2">
                {weekSummary.map(({ day, label, entries }) => {
                  const isActive = activeDay === day;
                  return (
                    <li
                      key={day}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                        isActive
                          ? 'border-orange-200 bg-white shadow-sm dark:border-orange-900/40 dark:bg-neutral-900'
                          : 'border-transparent bg-white/60 dark:bg-neutral-900/40'
                      }`}
                    >
                      <span
                        className={`w-24 shrink-0 text-sm font-medium ${
                          entries.length > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
                        }`}
                      >
                        {label}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                        {entries.length === 0 ? (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">empty</span>
                        ) : (
                          entries.map((time) => (
                            <span
                              key={`${day}-${time}`}
                              className="rounded-md border border-orange-100 bg-orange-50 px-2 py-0.5 font-mono text-xs text-neutral-800 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-100"
                            >
                              {time}
                            </span>
                          ))
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveDay(day)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-lg leading-none text-neutral-600 transition hover:border-[#F97316] hover:bg-orange-50 hover:text-[#F97316] dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-orange-700 dark:hover:bg-orange-950/30"
                        aria-label={`Edit ${label}`}
                        title={`Add slot on ${label}`}
                      >
                        +
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Platforms
                </p>
                <div className="mt-2">
                  <EcosystemPlatformBadges row={request} />
                </div>
              </div>
            </div>

            {/* Right — add slot */}
            <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Add a slot</h3>

              <div className="mt-4">
                <label
                  htmlFor="active-day-select"
                  className="block text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                >
                  Day
                </label>
                <select
                  id="active-day-select"
                  className="mt-1 block w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-900 focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  value={activeDay}
                  onChange={(e) => setActiveDay(Number(e.target.value))}
                >
                  {WEEK_DAYS.map((d) => {
                    const c = countOnDay(watchedSlots ?? [], d.value);
                    return (
                      <option key={d.value} value={d.value}>
                        {d.label}
                        {c > 0 ? ` — ${c} slot${c > 1 ? 's' : ''}` : ' — empty'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="draft-time"
                  className="block text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                >
                  Time
                </label>
                <div className="mt-1 flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="draft-time"
                      type="time"
                      value={draftTime}
                      onChange={(e) => setDraftTime(e.target.value)}
                      disabled={!canAppendSlot}
                      className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => appendSlotForActiveDay()}
                    disabled={!canAppendSlot}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-base leading-none">+</span> Add
                  </button>
                </div>
                {draftError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{draftError}</p>}
                {!canAppendSlot && (
                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    Weekly limit reached ({nb} slots). Remove one to add another.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {dayLabel(activeDay)}
                  {onThisDay > 0 ? ` — ${onThisDay} slot${onThisDay > 1 ? 's' : ''}` : ''}
                </p>

                {indicesForActiveDay.length === 0 ? (
                  <p className="mt-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400">
                    No times on this day yet. Pick a time and click <strong>Add</strong>.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {indicesForActiveDay.map((flatIdx, displayIdx) => (
                      <li
                        key={flatIdx}
                        className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/50"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-xs font-bold text-white">
                          {displayIdx + 1}
                        </span>
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <ClockIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                          <input
                            type="time"
                            className="w-full min-w-0 rounded-lg border border-transparent bg-transparent py-1 text-sm font-mono text-neutral-900 focus:border-[#F97316] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#F97316] dark:text-white dark:focus:bg-neutral-900"
                            {...register(`publicationSlots.${flatIdx}.time`)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTimeAt(flatIdx)}
                          className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {slotsError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{slotsError}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || missingCount > 0 || actionsLocked}
            title={missingCount > 0 ? 'Complete all slots before saving.' : undefined}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SaveIcon />
            {isSubmitting ? 'Saving…' : 'Save schedule'}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
