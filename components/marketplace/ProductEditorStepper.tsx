'use client';

type EditorStep = {
  id: string;
  label: string;
  description?: string;
};

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
}: ProductEditorStepperProps) {
  return (
    <nav aria-label="Product form steps" className="w-full">
      <ol className="flex gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const selected = index === currentIndex;
          const done = index < currentIndex || (!selected && index < maxReachedIndex);
          const clickable = !selected && index <= maxReachedIndex;

          const ariaLabel = selected
            ? `Step ${index + 1}: ${step.label} (current)`
            : clickable
              ? `Go to step ${index + 1}: ${step.label}${done ? ' (completed)' : ''}`
              : `Step ${index + 1}: ${step.label} (not reached yet)`;

          return (
            <li key={step.id} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onStepSelect(index)}
                aria-current={selected ? 'step' : undefined}
                aria-label={ariaLabel}
                className="group w-full text-left outline-none disabled:cursor-default"
              >
                <span
                  className={`block h-[3px] rounded-full transition-colors duration-300 ${
                    selected || done
                      ? 'bg-[#111111] dark:bg-white'
                      : 'bg-black/[0.08] group-enabled:group-hover:bg-black/20 dark:bg-white/[0.1] dark:group-enabled:group-hover:bg-white/25'
                  }`}
                />
                <span className="mt-3 flex items-baseline gap-2">
                  <span
                    className={`text-[12px] font-medium tabular-nums ${
                      selected || done ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`truncate text-[14px] transition-colors ${
                      selected
                        ? 'font-semibold text-[#111111] dark:text-white'
                        : done
                          ? 'font-medium text-neutral-600 group-hover:text-[#111111] dark:text-neutral-300 dark:group-hover:text-white'
                          : 'font-medium text-neutral-400 dark:text-neutral-600'
                    } ${selected ? '' : 'hidden sm:inline'}`}
                  >
                    {step.label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
