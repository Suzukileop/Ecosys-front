import {
  profileSectionEmptyClass,
  profileSectionFieldClass,
  profileSectionLabelClass,
  profileSectionValueClass,
} from '@/components/creator/studio/profile-section-ui';

type ProfileReadOnlyFieldProps = {
  label: string;
  value?: string | null;
  emptyLabel?: string;
  href?: string;
};

export function ProfileReadOnlyField({
  label,
  value,
  emptyLabel = 'Not set',
  href,
  variant = 'boxed',
}: ProfileReadOnlyFieldProps & { variant?: 'boxed' | 'flat' }) {
  const display = value?.trim();

  if (variant === 'flat') {
    return (
      <div className="border-b border-neutral-200/50 py-6 last:border-b-0 sm:py-7 dark:border-white/[0.04]">
        <p className={profileSectionLabelClass}>{label}</p>
        {display ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-base font-semibold text-[#111111] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:text-white"
            >
              {display}
            </a>
          ) : (
            <p className="mt-3 text-base font-semibold leading-relaxed whitespace-pre-wrap text-neutral-900 dark:text-neutral-50">
              {display}
            </p>
          )
        ) : (
          <p className="mt-3 text-base italic text-neutral-500 dark:text-neutral-400">{emptyLabel}</p>
        )}
      </div>
    );
  }

  return (
    <div className={profileSectionFieldClass}>
      <p className={profileSectionLabelClass}>{label}</p>
      {display ? (
        href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${profileSectionValueClass} block text-[#111111] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:text-white`}
          >
            {display}
          </a>
        ) : (
          <p className={`${profileSectionValueClass} whitespace-pre-wrap`}>{display}</p>
        )
      ) : (
        <p className={profileSectionEmptyClass}>{emptyLabel}</p>
      )}
    </div>
  );
}
