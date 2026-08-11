'use client';

import { ECOSYSTEM_STEP_LABELS } from '@/lib/ecosystem-steps';

type Props = {
  currentStepIndex: number;
  selectedIndex: number;
  onReturnToCurrent: () => void;
};

export function StepActionsLockedBanner({ currentStepIndex, selectedIndex, onReturnToCurrent }: Props) {
  const label = ECOSYSTEM_STEP_LABELS[currentStepIndex] ?? 'current step';
  const isAhead = selectedIndex > currentStepIndex;

  return (
    <div className="rounded-xl border border-[#F97316]/25 bg-[#FFF7ED] px-4 py-3 text-sm text-[#9A3412] dark:border-[#F97316]/30 dark:bg-[#F97316]/10 dark:text-[#FB923C]">
      {isAhead ? (
        <>
          You skipped ahead — this step unlocks when your agent delivers the validation model.{' '}
        </>
      ) : (
        <>You are viewing a previous step. Actions are disabled to avoid workflow issues. </>
      )}
      <button
        type="button"
        onClick={onReturnToCurrent}
        className="font-semibold underline underline-offset-2 hover:text-[#EA580C]"
      >
        Return to {label}
      </button>
    </div>
  );
}
