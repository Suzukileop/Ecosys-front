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

/** Premium single-select role grid — click a card to choose. */
export function ProfileAppRoleField({ value, disabled, onChange }: ProfileAppRoleFieldProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Choose one role so we can tailor your experience on the platform.
      </p>

      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        role="radiogroup"
        aria-label="My Role"
      >
        {CREATOR_APP_ROLE_OPTIONS.map((option) => {
          const selected = value === option.value;
          const accent = creatorAppRoleAccent(option.value);
          const descriptionLines = Array.isArray(option.description)
            ? option.description
            : [option.description];
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
              className={`group relative flex min-h-[9.5rem] flex-col items-start rounded-2xl bg-white px-4 pb-4 pt-5 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-neutral-950 dark:focus-visible:ring-offset-neutral-900 ${
                accent.focusRing
              } ${
                selected
                  ? `border-2 ${accent.borderSelected} shadow-sm`
                  : `border ${accent.border} hover:brightness-[0.98] dark:hover:brightness-110`
              } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              {selected ? (
                <span
                  className={`absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full shadow-sm ${accent.check}`}
                  aria-hidden
                >
                  <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                </span>
              ) : null}

              <span
                className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  selected ? accent.iconSelected : accent.iconIdle
                }`}
                aria-hidden
              >
                <FontAwesomeIcon
                  icon={ROLE_ICONS[option.value]}
                  className="h-4 w-4"
                  fixedWidth
                />
              </span>

              <span
                className={`pr-7 text-sm font-semibold tracking-tight ${
                  selected
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-800 dark:text-neutral-100'
                }`}
              >
                {option.label}
              </span>

              {option.value === 'GENERAL_MEMBER' ? (
                <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Default
                </span>
              ) : null}

              {descriptionLines.length > 1 ? (
                <ul
                  className={`mt-2 list-disc space-y-1.5 pl-4 text-sm leading-relaxed ${
                    selected
                      ? 'text-neutral-600 dark:text-neutral-300'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {descriptionLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <span
                  className={`mt-2 text-sm leading-relaxed ${
                    selected
                      ? 'text-neutral-600 dark:text-neutral-300'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {descriptionLines[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
