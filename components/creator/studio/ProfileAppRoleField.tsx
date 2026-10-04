'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faGraduationCap, faStore, faTags, faUser, faUserTie } from '@fortawesome/free-solid-svg-icons';
import {
  CREATOR_APP_ROLE_OPTIONS,
  creatorAppRoleAccent,
  type CreatorAppRole,
} from '@/lib/creator-app-role';

const ROLE_ICONS: Record<CreatorAppRole, IconDefinition> = {
  GENERAL_MEMBER: faUser,
  SERVICE_PROVIDER: faStore,
  FREELANCER_STUDENT: faGraduationCap,
  SELLER: faTags,
  RH_RECRUITER: faUserTie,
};

type ProfileAppRoleFieldProps = {
  value: CreatorAppRole;
  disabled?: boolean;
  onChange: (role: CreatorAppRole) => void;
};

/** Single-select role list — hairline rows, the chosen role unfolds its full description. */
export function ProfileAppRoleField({ value, disabled, onChange }: ProfileAppRoleFieldProps) {
  return (
    <div className="space-y-8">
      <p className="max-w-xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        Choose one role so we can tailor your experience on the platform.
      </p>

      <div
        className="divide-y divide-black/[0.06] border-y border-black/[0.06] dark:divide-white/[0.08] dark:border-white/[0.08]"
        role="radiogroup"
        aria-label="My Role"
      >
        {CREATOR_APP_ROLE_OPTIONS.map((option) => {
          const selected = value === option.value;
          const accent = creatorAppRoleAccent(option.value);
          const lines = Array.isArray(option.description) ? option.description : [option.description];
          const [summary, ...details] = lines;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => {
                if (!disabled && !selected) onChange(option.value);
              }}
              className={`group flex w-full items-start gap-5 py-6 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:gap-6 sm:py-7 ${
                accent.focusRing
              } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <span
                className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity duration-200 ${
                  selected ? accent.iconSelected : `${accent.iconIdle} opacity-70 group-hover:opacity-100`
                }`}
                aria-hidden
              >
                <FontAwesomeIcon icon={ROLE_ICONS[option.value]} className="h-3.5 w-3.5" fixedWidth />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={`text-[17px] font-semibold tracking-[-0.01em] transition-colors ${
                      selected
                        ? 'text-[#111111] dark:text-white'
                        : 'text-neutral-700 group-hover:text-[#111111] dark:text-neutral-300 dark:group-hover:text-white'
                    }`}
                  >
                    {option.label}
                  </span>
                  {option.value === 'GENERAL_MEMBER' ? (
                    <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                      Default
                    </span>
                  ) : null}
                </span>

                <span className="mt-1.5 block max-w-2xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {summary}
                </span>

                {selected && details.length > 0 ? (
                  <span className="mt-3 block max-w-2xl space-y-2">
                    {details.map((line) => (
                      <span
                        key={line}
                        className="flex gap-3 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400"
                      >
                        <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-neutral-300 dark:bg-neutral-600" />
                        {line}
                      </span>
                    ))}
                  </span>
                ) : null}
              </span>

              <span
                aria-hidden
                className={`mt-2.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                  selected
                    ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                    : 'border-neutral-300 group-hover:border-neutral-500 dark:border-neutral-600 dark:group-hover:border-neutral-400'
                }`}
              >
                {selected ? <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
