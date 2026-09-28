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
  /** `studio`: text-only controls and hairline fields for the portfolio inline editor. */
  variant?: 'default' | 'studio';
};

const PRESET_OPTIONS: { id: DayPreset; label: string }[] = [
  { id: 'weekdays', label: 'Mon–Fri' },
  { id: 'mon_sat', label: 'Mon–Sat' },
  { id: 'everyday', label: 'Every day' },
  { id: 'custom', label: 'Custom' },
];

export function AvailabilityHoursInput({
  value,
  onChange,
  disabled = false,
  timezoneId,
  variant = 'default',
}: AvailabilityHoursInputProps) {
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

  if (variant === 'studio') {
    return (
      <StudioAvailability
        value={value}
        onChange={onChange}
        disabled={disabled}
        timezoneId={timezoneId}
        setPreset={setPreset}
        toggleDay={toggleDay}
      />
    );
  }

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

const STUDIO_SUBLABEL = 'text-[13px] font-semibold text-neutral-500 dark:text-neutral-400';
const STUDIO_TIME_INPUT =
  'block w-full border-b border-black/[0.08] bg-transparent pb-2 text-base tabular-nums text-black outline-none focus:border-[#FF5722] disabled:opacity-60 dark:border-white/[0.08] dark:text-white dark:[color-scheme:dark] dark:focus:border-[#FF5722]';

function StudioAvailability({
  value,
  onChange,
  disabled,
  timezoneId,
  setPreset,
  toggleDay,
}: {
  value: AvailabilitySchedule;
  onChange: (value: AvailabilitySchedule) => void;
  disabled: boolean;
  timezoneId?: string | null;
  setPreset: (preset: DayPreset) => void;
  toggleDay: (index: number) => void;
}) {
  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <p className={STUDIO_SUBLABEL}>Days</p>
        <div role="radiogroup" aria-label="Days" className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          {PRESET_OPTIONS.map((opt) => {
            const active = value.preset === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => setPreset(opt.id)}
                className={`relative pb-1.5 text-[15px] transition-colors duration-200 disabled:opacity-40 ${
                  active
                    ? 'font-semibold text-black dark:text-white'
                    : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {opt.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#FF5722] ${active ? '' : 'invisible'}`}
                />
              </button>
            );
          })}
        </div>

        {value.preset === 'custom' ? (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {DAY_LABELS.map((label, index) => {
              const on = value.customDays[index];
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  disabled={disabled}
                  onClick={() => toggleDay(index)}
                  className={`h-9 min-w-[3rem] rounded-full px-3 text-[13px] font-semibold capitalize transition-colors duration-200 disabled:opacity-40 ${
                    on
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-neutral-400 hover:bg-black/[0.04] hover:text-black dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-white'
                  }`}
                >
                  {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className={`block ${STUDIO_SUBLABEL}`}>From</span>
          <input
            type="time"
            disabled={disabled}
            value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className={STUDIO_TIME_INPUT}
            data-studio-underline=""
          />
        </label>
        <label className="block space-y-2">
          <span className={`block ${STUDIO_SUBLABEL}`}>To</span>
          <input
            type="time"
            disabled={disabled}
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className={STUDIO_TIME_INPUT}
            data-studio-underline=""
          />
        </label>
      </div>

      {timezoneId ? (
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
          Local time · <span className="text-black dark:text-white">{timezoneId}</span>
        </p>
      ) : null}
    </div>
  );
}
