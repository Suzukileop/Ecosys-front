'use client';

import { PRODUCT_EDITOR_STEPS } from '@/components/marketplace/product-editor-steps';

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

type ProductEditorStepperProps = {
  currentIndex: number;
  maxReachedIndex: number;
  onStepSelect: (index: number) => void;
  embedded?: boolean;
};

export function ProductEditorStepper({
  currentIndex,
  maxReachedIndex,
  onStepSelect,
  embedded = false,
}: ProductEditorStepperProps) {
  const total = PRODUCT_EDITOR_STEPS.length;
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <nav aria-label="Product form steps" className="w-full">
      <div
        className={
          embedded
            ? 'space-y-4'
            : 'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none sm:p-5'
        }
      >
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
            Step {currentIndex + 1} of {total}
          </p>
          <p className="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {PRODUCT_EDITOR_STEPS[currentIndex].label}
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800 sm:hidden">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={total}
          />
        </div>

        <ol className="hidden items-start sm:flex">
          {PRODUCT_EDITOR_STEPS.map((step, index) => {
            const reachable = index <= maxReachedIndex;
            const selected = index === currentIndex;
            const completed = index < currentIndex;
            const isLast = index === PRODUCT_EDITOR_STEPS.length - 1;
            const leftLineDone = index > 0 && index <= maxReachedIndex;
            const rightLineDone = index < maxReachedIndex;

            return (
              <li
                key={step.id}
                className={`flex flex-col items-center ${isLast ? 'shrink-0' : 'min-w-0 flex-1'}`}
              >
                <div className="flex w-full items-center">
                  {index > 0 ? (
                    <div
                      className={`h-0.5 flex-1 transition-colors ${
                        leftLineDone ? 'bg-orange-400 dark:bg-orange-500' : 'bg-neutral-200 dark:bg-neutral-700'
                      }`}
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
                    aria-label={`${step.label}${selected ? ' (current)' : ''}`}
                    className={`relative flex shrink-0 items-center justify-center rounded-full transition ${
                      reachable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                    }`}
                  >
                    {selected ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-orange-500 bg-white shadow-sm dark:bg-neutral-950">
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{index + 1}</span>
                      </span>
                    ) : completed ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white">
                        <CheckIcon />
                      </span>
                    ) : reachable ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-orange-300 bg-white dark:border-orange-500/40 dark:bg-neutral-950">
                        <span className="text-xs font-semibold text-orange-500">{index + 1}</span>
                      </span>
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
                        <span className="text-xs font-medium text-neutral-400">{index + 1}</span>
                      </span>
                    )}
                  </button>

                  {!isLast ? (
                    <div
                      className={`h-0.5 flex-1 transition-colors ${
                        rightLineDone ? 'bg-orange-400 dark:bg-orange-500' : 'bg-neutral-200 dark:bg-neutral-700'
                      }`}
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="flex-1" aria-hidden="true" />
                  )}
                </div>

                <p
                  className={`mt-2 hidden max-w-[5.5rem] text-center text-[11px] font-medium leading-tight lg:block xl:max-w-none xl:text-xs ${
                    selected
                      ? 'text-orange-600 dark:text-orange-400'
                      : completed
                        ? 'text-neutral-700 dark:text-neutral-300'
                        : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {step.label}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
