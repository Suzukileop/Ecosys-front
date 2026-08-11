'use client';

import {
  ECOSYSTEM_STEP_LABELS,
  stepIndexForNextStep,
} from '@/lib/ecosystem-steps';
import type { NextStep } from '@/types/ecosystem';

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  nextStep: NextStep | string;
  selectedIndex: number;
  onStepSelect: (index: number) => void;
};

export function StatusStepper({ nextStep, selectedIndex, onStepSelect }: Props) {
  const currentIndex = stepIndexForNextStep(nextStep);

  return (
    <nav aria-label="Ecosystem workflow steps" className="w-full">
      <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:px-6">
        <ol className="flex items-start">
          {ECOSYSTEM_STEP_LABELS.map((label, index) => {
            const reachable = index <= currentIndex;
            const selected = index === selectedIndex;
            const completed = index < currentIndex;
            const isLast = index === ECOSYSTEM_STEP_LABELS.length - 1;
            const leftLineDone = index > 0 && index <= currentIndex;
            const rightLineDone = index < currentIndex;

            return (
              <li
                key={label}
                className={`flex flex-col items-center ${isLast ? 'shrink-0' : 'min-w-0 flex-1'}`}
              >
                <div className="flex w-full items-center">
                  {index > 0 ? (
                    <div
                      className={`h-0.5 flex-1 ${leftLineDone ? 'bg-neutral-800 dark:bg-neutral-300' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="flex-1" aria-hidden="true" />
                  )}

                  <button
                    type="button"
                    disabled={!reachable}
                    onClick={() => reachable && onStepSelect(index)}
                    aria-current={selected ? 'step' : undefined}
                    aria-label={`${label}${selected ? ' (viewing)' : ''}${index === currentIndex ? ' (current)' : ''}`}
                    className={`relative flex shrink-0 items-center justify-center rounded-full transition ${
                      reachable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                    }`}
                  >
                    {selected ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#F97316] bg-white dark:bg-neutral-950">
                        <span className="h-2 w-2 rounded-full bg-[#F97316]" />
                      </span>
                    ) : completed ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900">
                        <CheckIcon />
                      </span>
                    ) : index === currentIndex ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#F97316] bg-white dark:bg-neutral-950">
                        <span className="h-2 w-2 rounded-full bg-[#F97316]" />
                      </span>
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-950" />
                    )}
                  </button>

                  {!isLast ? (
                    <div
                      className={`h-0.5 flex-1 ${rightLineDone ? 'bg-neutral-800 dark:bg-neutral-300' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="flex-1" aria-hidden="true" />
                  )}
                </div>

                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && onStepSelect(index)}
                  className={`mt-2 max-w-[4.5rem] text-center text-[10px] font-medium leading-tight sm:max-w-none sm:text-xs ${
                    selected
                      ? 'font-semibold text-neutral-900 dark:text-white'
                      : reachable
                        ? 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                        : 'text-neutral-400 dark:text-neutral-500'
                  } ${reachable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
