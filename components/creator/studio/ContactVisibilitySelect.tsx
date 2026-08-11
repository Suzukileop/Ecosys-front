import type { ContactVisibilityLevel } from '@/lib/contact-visibility';
import { CONTACT_VISIBILITY_OPTIONS } from '@/lib/contact-visibility';
import {
  profileFormInputClass,
  profileSectionMutedTextClass,
} from '@/components/creator/studio/profile-section-ui';

type ContactVisibilitySelectProps = {
  id: string;
  label: string;
  value: ContactVisibilityLevel;
  onChange: (value: ContactVisibilityLevel) => void;
};

export function ContactVisibilitySelect({ id, label, value, onChange }: ContactVisibilitySelectProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <label htmlFor={id} className={`${profileSectionMutedTextClass} font-semibold text-neutral-700 dark:text-neutral-300`}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as ContactVisibilityLevel)}
        className={`${profileFormInputClass} mt-0 w-full sm:max-w-[12rem]`}
      >
        {CONTACT_VISIBILITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
