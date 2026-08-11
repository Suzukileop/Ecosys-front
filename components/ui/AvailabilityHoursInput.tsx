'use client';

import {
  DAY_LABELS,
  PRESET_DAYS,
  type AvailabilitySchedule,
  type DayPreset,
} from '@/lib/availabilityHours';

type AvailabilityHoursInputProps = {
  value: AvailabilitySchedule;
  onChange: (value: AvailabilitySchedule) => void;
  disabled?: boolean;
  timezoneId?: string | null;
};

const PRESET_OPTIONS: { id: DayPreset; label: string }[] = [
  { id: 'weekdays', label: 'Mon–Fri' },
  { id: 'mon_sat', label: 'Mon–Sat' },
  { id: 'everyday', label: 'Every day' },
  { id: 'custom', label: 'Custom' },
];

export function AvailabilityHoursInput({ value, onChange, disabled = false, timezoneId }: AvailabilityHoursInputProps) {
  const setPreset = (preset: DayPreset) => {
    onChange({
      ...value,
      preset,
      customDays: preset === 'custom' ? value.customDays : [...PRESET_DAYS[preset]],
    });
  };

  const toggleDay = (index: number) => {
    const next = [...value.customDays];
    next[index] = !next[index];
    onChange({ ...value, preset: 'custom', customDays: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Days</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => setPreset(opt.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                value.preset === opt.id
                  ? 'bg-orange-500 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {value.preset === 'custom' && (
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => toggleDay(index)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                value.customDays[index]
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'border border-neutral-200 text-neutral-500 dark:border-neutral-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="availability-start" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Start time
          </label>
          <input
            id="availability-start"
            type="time"
            disabled={disabled}
            value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
        <div>
          <label htmlFor="availability-end" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            End time
          </label>
          <input
            id="availability-end"
            type="time"
            disabled={disabled}
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
      </div>

      {timezoneId && (
        <p className="text-xs text-neutral-500">Times use your profile timezone: {timezoneId}</p>
      )}
    </div>
  );
}
