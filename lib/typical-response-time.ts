import { msg } from '@/lib/i18n/config';
/** Manual typical-response presets (must match backend CreatorResponseTimeService). */
export const TYPICAL_RESPONSE_TIME_OPTIONS = [
  {
    value: 'WITHIN_1_HOUR',
    label: msg('Usually within 1 hour'),
  },
  {
    value: 'FEW_HOURS',
    label: msg('Usually within a few hours'),
  },
  {
    value: 'WITHIN_DAY',
    label: msg('Usually within a day'),
  },
  {
    value: 'WITHIN_2_3_DAYS',
    label: msg('Usually within 2-3 days'),
  },
] as const;
