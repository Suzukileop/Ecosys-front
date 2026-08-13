'use client';

import type { ProductFormat } from '@/components/marketplace/product-editor-steps';

type ProductFormatToggleProps = {
  value: ProductFormat;
  onChange: (format: ProductFormat) => void;
  disabled?: boolean;
  /** When true, only the active format card is shown (edit mode). */
  hideInactive?: boolean;
};

const OPTIONS: {
  id: ProductFormat;
  title: string;
  subtitle: string;
}[] = [
  {
    id: 'virtual',
    title: 'Virtual',
    subtitle: 'Delivered online',
  },
  {
    id: 'physical',
    title: 'Physical',
    subtitle: 'Shipped to buyer',
  },
];

export function ProductFormatToggle({
  value,
  onChange,
  disabled,
  hideInactive = false,
}: ProductFormatToggleProps) {
  const options = hideInactive ? OPTIONS.filter((option) => option.id === value) : OPTIONS;

  return (
    <div
      role="radiogroup"
      aria-label="Product format"
      className="flex flex-row flex-wrap items-stretch gap-2"
    >
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled || hideInactive}
            onClick={() => onChange(option.id)}
            className={`min-w-[9.5rem] flex-1 rounded-xl border bg-transparent px-3.5 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 disabled:cursor-default dark:focus-visible:ring-offset-neutral-900 sm:flex-none ${
              selected
                ? 'border-orange-500 dark:border-orange-400'
                : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-500'
            }`}
          >
            <span className="block text-sm font-semibold text-neutral-900 dark:text-white">
              {option.title}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
              {option.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
