import { profileSectionMutedTextClass } from '@/components/creator/studio/profile-section-ui';

type ProfileSectionItemCountProps = {
  /** Current number of items. */
  count: number;
  /** Free-plan cap (e.g. 5). */
  limit: number;
  /** Plural unit, e.g. "FAQ items", "products". */
  unit: string;
  className?: string;
};

/** Live free-plan usage counter shown above portfolio section lists. */
export function ProfileSectionItemCount({
  count,
  limit,
  unit,
  className,
}: ProfileSectionItemCountProps) {
  const safeCount = Math.max(0, count);
  return (
    <p className={`${profileSectionMutedTextClass}${className ? ` ${className}` : ''}`}>
      <strong className="text-neutral-800 dark:text-neutral-200">
        {safeCount}/{limit}
      </strong>{' '}
      {unit}
    </p>
  );
}
