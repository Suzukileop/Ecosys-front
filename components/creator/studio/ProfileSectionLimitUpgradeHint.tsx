import Link from 'next/link';
import { profileSectionMutedTextClass } from '@/components/creator/studio/profile-section-ui';
import { PORTFOLIO_UPGRADE_PATH } from '@/components/portfolio/portfolio-pricing-upgrade-panel';

type ProfileSectionLimitUpgradeHintProps = {
  /** Free-plan cap (e.g. 3). */
  limit: number;
  /** Plural unit after the number, e.g. "products", "services". */
  unit: string;
  className?: string;
};

/** Shared free-plan limit + upgrade CTA used across portfolio section pickers. */
export function ProfileSectionLimitUpgradeHint({
  limit,
  unit,
  className,
}: ProfileSectionLimitUpgradeHintProps) {
  return (
    <p className={`${profileSectionMutedTextClass}${className ? ` ${className}` : ''}`}>
      Choose up to{' '}
      <strong className="text-neutral-800 dark:text-neutral-200">
        {limit} {unit}
      </strong>
      .{' '}
      <Link
        href={PORTFOLIO_UPGRADE_PATH}
        className="font-semibold text-orange-600 underline-offset-2 hover:underline dark:text-orange-400"
      >
        Upgrade your plan
      </Link>{' '}
      for unlimited insertion.
    </p>
  );
}
