export type DayPreset = 'weekdays' | 'mon_sat' | 'everyday' | 'custom';

export type AvailabilitySchedule = {
  preset: DayPreset;
  customDays: boolean[];
  start: string;
  end: string;
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const PRESET_DAYS: Record<Exclude<DayPreset, 'custom'>, boolean[]> = {
  weekdays: [true, true, true, true, true, false, false],
  mon_sat: [true, true, true, true, true, true, false],
  everyday: [true, true, true, true, true, true, true],
};

export function defaultSchedule(): AvailabilitySchedule {
  return {
    preset: 'weekdays',
    customDays: [...PRESET_DAYS.weekdays],
    start: '09:00',
    end: '18:00',
  };
}

function normalizeTime(raw: string): string {
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '09:00';
  const h = Math.min(23, Math.max(0, Number(match[1])));
  const m = Math.min(59, Math.max(0, Number(match[2])));
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDayRange(days: boolean[]): string {
  const active = days.map((on, i) => (on ? i : -1)).filter((i) => i >= 0);
  if (active.length === 0) return 'No days selected';
  if (active.length === 7) return 'Every day';
  if (active.join(',') === '0,1,2,3,4') return 'Mon–Fri';
  if (active.join(',') === '0,1,2,3,4,5') return 'Mon–Sat';
  if (active.length === 1) return DAY_LABELS[active[0]];
  const ranges: string[] = [];
  let start = active[0];
  let prev = active[0];
  for (let i = 1; i < active.length; i++) {
    if (active[i] === prev + 1) {
      prev = active[i];
      continue;
    }
    ranges.push(start === prev ? DAY_LABELS[start] : `${DAY_LABELS[start]}–${DAY_LABELS[prev]}`);
    start = active[i];
    prev = active[i];
  }
  ranges.push(start === prev ? DAY_LABELS[start] : `${DAY_LABELS[start]}–${DAY_LABELS[prev]}`);
  return ranges.join(', ');
}

export function formatAvailabilityHours(schedule: AvailabilitySchedule, timezoneId?: string | null): string {
  const daysLabel = schedule.preset === 'custom' ? formatDayRange(schedule.customDays) : formatDayRange(PRESET_DAYS[schedule.preset]);
  const start = normalizeTime(schedule.start);
  const end = normalizeTime(schedule.end);
  const tz = timezoneId?.trim();
  return tz ? `${daysLabel} · ${start}–${end} (${tz})` : `${daysLabel} · ${start}–${end}`;
}

/** Days + hours as separate lines — no timezone (used by About profile frame). */
export function formatAvailabilityHoursLines(schedule: AvailabilitySchedule): string[] {
  const daysLabel =
    schedule.preset === 'custom'
      ? formatDayRange(schedule.customDays)
      : formatDayRange(PRESET_DAYS[schedule.preset]);
  const start = normalizeTime(schedule.start);
  const end = normalizeTime(schedule.end);
  return [daysLabel, `${start}–${end}`];
}

export function parseAvailabilityHours(raw: string | null | undefined): AvailabilitySchedule {
  const fallback = defaultSchedule();
  const trimmed = raw?.trim();
  if (!trimmed) return fallback;

  const structured = trimmed.match(/^(.+?)\s*·\s*(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  if (structured) {
    const daysPart = structured[1].trim();
    const start = normalizeTime(structured[2]);
    const end = normalizeTime(structured[3]);
    let preset: DayPreset = 'custom';
    let customDays = [...fallback.customDays];
    if (daysPart === 'Mon–Fri' || daysPart === 'Mon-Fri') {
      preset = 'weekdays';
      customDays = [...PRESET_DAYS.weekdays];
    } else if (daysPart === 'Mon–Sat' || daysPart === 'Mon-Sat') {
      preset = 'mon_sat';
      customDays = [...PRESET_DAYS.mon_sat];
    } else if (daysPart === 'Every day') {
      preset = 'everyday';
      customDays = [...PRESET_DAYS.everyday];
    }
    return { preset, customDays, start, end };
  }

  const legacy = trimmed.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  if (legacy) {
    return {
      ...fallback,
      start: normalizeTime(legacy[1]),
      end: normalizeTime(legacy[2]),
    };
  }

  return { ...fallback, preset: 'custom', customDays: fallback.customDays };
}

export function getActiveDays(schedule: AvailabilitySchedule): boolean[] {
  return schedule.preset === 'custom' ? schedule.customDays : [...PRESET_DAYS[schedule.preset]];
}

const DAY_LABELS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;
const DAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function formatDayRangeLocalized(
  days: boolean[],
  labels: readonly string[],
  copy: { none: string; all: string; weekday: string; weekSat: string }
): string {
  const active = days.map((on, i) => (on ? i : -1)).filter((i) => i >= 0);
  if (active.length === 0) return copy.none;
  if (active.length === 7) return copy.all;
  if (active.join(',') === '0,1,2,3,4') return copy.weekday;
  if (active.join(',') === '0,1,2,3,4,5') return copy.weekSat;
  if (active.length === 1) return labels[active[0]];
  const ranges: string[] = [];
  let start = active[0];
  let prev = active[0];
  for (let i = 1; i < active.length; i++) {
    if (active[i] === prev + 1) {
      prev = active[i];
      continue;
    }
    ranges.push(start === prev ? labels[start] : `${labels[start]}–${labels[prev]}`);
    start = active[i];
    prev = active[i];
  }
  ranges.push(start === prev ? labels[start] : `${labels[start]}–${labels[prev]}`);
  return ranges.join(', ');
}

function formatDayRangeFr(days: boolean[]): string {
  return formatDayRangeLocalized(days, DAY_LABELS_FR, {
    none: 'Aucun jour sélectionné',
    all: 'Tous les jours',
    weekday: 'Lun–Ven',
    weekSat: 'Lun–Sam',
  });
}

function formatDayRangeEn(days: boolean[]): string {
  return formatDayRangeLocalized(days, DAY_LABELS_EN, {
    none: 'No days selected',
    all: 'Every day',
    weekday: 'Mon–Fri',
    weekSat: 'Mon–Sat',
  });
}

export function formatAvailabilityHoursFr(schedule: AvailabilitySchedule, timezoneId?: string | null): string {
  const daysLabel =
    schedule.preset === 'custom' ? formatDayRangeFr(schedule.customDays) : formatDayRangeFr(PRESET_DAYS[schedule.preset]);
  const start = normalizeTime(schedule.start);
  const end = normalizeTime(schedule.end);
  const tz = timezoneId?.trim();
  return tz ? `${daysLabel} · ${start}–${end} (${tz})` : `${daysLabel} · ${start}–${end}`;
}

/** Format stored hours for public display (English). */
export function formatAvailabilityDisplay(
  raw: string | null | undefined,
  timezoneId?: string | null
): string | null {
  if (!raw?.trim()) return null;
  const schedule = parseAvailabilityHours(raw);
  const daysLabel =
    schedule.preset === 'custom'
      ? formatDayRangeEn(schedule.customDays)
      : formatDayRangeEn(PRESET_DAYS[schedule.preset]);
  const start = normalizeTime(schedule.start);
  const end = normalizeTime(schedule.end);
  const tz = timezoneId?.trim();
  return tz ? `${daysLabel} · ${start}–${end} (${tz})` : `${daysLabel} · ${start}–${end}`;
}

export type AvailabilityDisplayParts = {
  days: string;
  hours: string;
  timezone: string | null;
};

/** Libellé court du fuseau (ex. « Antananarivo · UTC+3 »). */
export function formatTimezoneShort(timezoneId: string | null | undefined, locale = 'en-US'): string | null {
  const tz = timezoneId?.trim();
  if (!tz) return null;
  const city = tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;
  try {
    const offset = new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value;
    if (offset && offset !== 'GMT') {
      return `${city} · ${offset.replace('GMT', 'UTC')}`;
    }
  } catch {
    // ignore invalid timezone
  }
  return city;
}

/** Découpe horaires + fuseau pour affichage en carte compacte. */
export function getAvailabilityDisplayParts(
  raw: string | null | undefined,
  timezoneId?: string | null
): AvailabilityDisplayParts | null {
  if (!raw?.trim()) return null;
  const schedule = parseAvailabilityHours(raw);
  const days =
    schedule.preset === 'custom'
      ? formatDayRangeEn(schedule.customDays)
      : formatDayRangeEn(PRESET_DAYS[schedule.preset]);
  const start = normalizeTime(schedule.start);
  const end = normalizeTime(schedule.end);
  return {
    days,
    hours: `${start} – ${end}`,
    timezone: formatTimezoneShort(timezoneId),
  };
}

export { DAY_LABELS, PRESET_DAYS };
