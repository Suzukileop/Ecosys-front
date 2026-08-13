'use client';

import type { Control, UseFormRegister } from 'react-hook-form';
import { InlineBulletLinesField } from '@/components/marketplace/InlineBulletLinesField';
import type { ProductFormValues } from '@/components/marketplace/product-editor-schema';

type ProductSubtitlesFieldProps = {
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  label?: string;
  /** @deprecated ignored — kept for call-site compatibility */
  hint?: string;
  /** @deprecated ignored — kept for call-site compatibility */
  addLabel?: string;
  maxItems?: number;
  /** @deprecated always uses the inline bullet list */
  compact?: boolean;
};

export function ProductSubtitlesField({
  control,
  register,
  label = 'Demo captions',
  maxItems = 10,
}: ProductSubtitlesFieldProps) {
  return (
    <InlineBulletLinesField
      control={control}
      register={register}
      name="demoSubtitles"
      label={label}
      placeholderPrefix="Caption line"
      maxItems={maxItems}
    />
  );
}
