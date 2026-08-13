'use client';

type EditorStep = {
  id: string;
  label: string;
  description?: string;
};

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
  steps: readonly EditorStep[];
  currentIndex: number;
  maxReachedIndex: number;
  onStepSelect: (index: number) => void;
  embedded?: boolean;
};

export function ProductEditorStepper({
  steps,
  currentIndex,
  maxReachedIndex,
  onStepSelect,
  embedded = false,
}: ProductEditorStepperProps) {
  const total = steps.length;
  const progress = ((currentIndex + 1) / total) * 100;
  const gridClass = total <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-4';

  return (
    <nav aria-label="Product form steps" className="w-full">
      <div
        className={
          embedded
            ? 'space-y-3'
            : 'rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5'
        }
      >
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
            Step {currentIndex + 1} of {total}
          </p>
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
            {steps[currentIndex]?.label}
          </p>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800 sm:hidden">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={total}
          />
        </div>

        <ol className={`hidden sm:grid sm:gap-0 ${gridClass}`}>
          {steps.map((step, index) => {
            const selected = index === currentIndex;
            const completed = !selected && index < maxReachedIndex;
            const clickable = !selected && index <= maxReachedIndex;
            const isLast = index === steps.length - 1;
            const lineDone = index < maxReachedIndex || index < currentIndex;

            const ariaLabel = selected
              ? `Étape ${index + 1} : ${step.label} — en cours`
              : completed
                ? `Retour à l'étape ${index + 1} : ${step.label} — complétée`
                : clickable
                  ? `Retour à l'étape ${index + 1} : ${step.label}`
                  : `Étape ${index + 1} : ${step.label} — non atteinte`;

            return (
              <li key={step.id} className="relative flex flex-col items-center px-1">
                {!isLast ? (
                  <div
                    className={`absolute top-4 left-[calc(50%+1rem)] right-[calc(-50%+1rem)] h-px transition-colors duration-200 ease-out ${
                      lineDone ? 'bg-orange-400' : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}
                    aria-hidden="true"
                  />
                ) : null}

                <button
                  type="button"
                  disabled={!clickable && !selected}
                  onClick={() => {
                    if (clickable) onStepSelect(index);
                  }}
                  aria-current={selected ? 'step' : undefined}
                  aria-label={ariaLabel}
                  className={`relative z-[1] flex shrink-0 items-center justify-center rounded-full transition-all duration-200 ease-out ${
                    clickable
                      ? 'cursor-pointer hover:scale-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900'
                      : selected
                        ? 'cursor-default'
                        : 'cursor-default opacity-40'
                  }`}
                >
                  {selected ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white transition-all duration-200 ease-out">
                      {index + 1}
                    </span>
                  ) : completed ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white transition-all duration-200 ease-out">
                      <CheckIcon />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-400 transition-all duration-200 ease-out dark:bg-neutral-800 dark:text-neutral-500">
                      {index + 1}
                    </span>
                  )}
                </button>

                <p
                  className={`mt-2.5 text-center text-[11px] leading-tight transition-colors duration-200 ease-out xl:text-xs ${
                    selected
                      ? 'font-bold text-neutral-900 dark:text-white'
                      : completed
                        ? 'font-semibold text-orange-600 dark:text-orange-400'
                        : clickable
                          ? 'font-medium text-neutral-600 dark:text-neutral-400'
                          : 'font-medium text-neutral-300 dark:text-neutral-600'
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
