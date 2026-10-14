'use client';
import { useT } from '@/lib/i18n/I18nProvider';

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function StarRatingInput({ value, onChange, disabled }: StarRatingInputProps) {
  const t = useT();
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[rgba(255,180,0,0.12)] disabled:opacity-50"
            aria-label={t('Rate {star} stars', { star })}
          >
            <svg
              className={`h-7 w-7 ${star <= value ? 'text-[#FFB400]' : 'text-[#CFD9DE] dark:text-[#3E4144]'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
