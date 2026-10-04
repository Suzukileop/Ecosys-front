'use client';

import {
  CV_SECTIONS,
  cvDefaultLabel,
  type AtsVariantId,
  type CvSectionId,
  type CvSectionLabels,
  type CvTemplateId,
} from '@/lib/cv-data';

/** Headings each layout actually prints — the others are hidden from the editor. */
const SECTIONS_BY_TEMPLATE: Record<CvTemplateId, readonly CvSectionId[]> = {
  ats: ['summary', 'experience', 'education', 'skills', 'languages', 'interests'],
  modern: ['contact', 'skills', 'languages', 'experience', 'education'],
  editorial: ['summary', 'experience', 'education', 'skills', 'languages'],
};

export function CvSectionLabelsPanel({
  template,
  atsVariant,
  labels,
  maxLength,
  onChange,
}: {
  template: CvTemplateId;
  atsVariant: AtsVariantId;
  labels: CvSectionLabels;
  maxLength: number;
  onChange: (next: CvSectionLabels) => void;
}) {
  const visible = CV_SECTIONS.filter((section) => SECTIONS_BY_TEMPLATE[template].includes(section.id));
  const hasCustom = visible.some((section) => labels[section.id]?.trim());

  return (
    <div aria-label="Section labels" className="space-y-4">
      <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        Leave a field empty to keep the default.
        {template === 'ats' ? ' ATS software reads standard headings best.' : null}
      </p>

      <div className="space-y-3">
        {visible.map((section) => {
          const fallback = cvDefaultLabel(template, atsVariant, section.id);
          const id = `cv-label-${section.id}`;
          return (
            <div key={section.id} className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
              <label htmlFor={id} className="text-[13px] text-neutral-500 dark:text-neutral-400">
                {section.name}
              </label>
              <input
                id={id}
                type="text"
                value={labels[section.id] ?? ''}
                placeholder={fallback}
                maxLength={maxLength}
                autoComplete="off"
                onChange={(event) => onChange({ ...labels, [section.id]: event.currentTarget.value })}
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-transparent px-3 text-[14px] text-[#111111] outline-none transition-colors placeholder:text-neutral-400 focus:border-black/30 dark:border-white/[0.1] dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-white/30"
              />
            </div>
          );
        })}
      </div>

      {hasCustom ? (
        <button
          type="button"
          onClick={() => {
            const next = { ...labels };
            for (const section of visible) delete next[section.id];
            onChange(next);
          }}
          className="text-[13px] font-medium text-neutral-500 underline-offset-4 transition-colors hover:text-[#111111] hover:underline dark:text-neutral-400 dark:hover:text-white"
        >
          Reset to defaults
        </button>
      ) : null}
    </div>
  );
}
