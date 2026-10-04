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
    title: 'Digital',
    subtitle: 'Delivered online',
  },
  {
    id: 'physical',
    title: 'Material',
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
            onClick={() => {
              if (!selected) onChange(option.id);
            }}
            className={`flex min-w-[10rem] flex-1 items-start gap-3 rounded-lg border bg-transparent px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 focus-visible:ring-offset-2 disabled:cursor-default dark:focus-visible:ring-offset-[#111111] sm:flex-none ${
              selected
                ? 'border-[#111111] dark:border-white'
                : 'border-black/[0.12] hover:border-black/25 dark:border-white/[0.14] dark:hover:border-white/30'
            }`}
          >
            <span
              aria-hidden
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                selected ? 'border-[#111111] dark:border-white' : 'border-black/25 dark:border-white/30'
              }`}
            >
              {selected ? <span className="h-2 w-2 rounded-full bg-[#111111] dark:bg-white" /> : null}
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-[#111111] dark:text-white">{option.title}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-neutral-500 dark:text-neutral-400">
                {option.subtitle}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
