'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { groupBySpecialty } from '@/lib/specialties';
import type { ProfileStrengthTool } from '@/types/ecosystem';

type PublicSkillsToolsGroupedProps = {
  skillTags: string[];
  tools: ProfileStrengthTool[];
  allowedSpecialties?: string[];
};

function MetaChip({
  label,
  iconUrl,
  showLogo,
}: {
  label: string;
  iconUrl?: string | null;
  showLogo?: boolean;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 py-1.5 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ${
        showLogo ? 'pl-1.5 pr-3' : 'px-3'
      }`}
      title={label}
    >
      {showLogo ? <CreatorToolLogo label={label} iconUrl={iconUrl} size={22} /> : null}
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}

function SpecialtyGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
          {title}
        </span>
        <span
          className={`text-neutral-400 transition-transform dark:text-neutral-500 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open ? <div className="border-t border-neutral-200/80 px-3.5 py-3 dark:border-neutral-800">{children}</div> : null}
    </div>
  );
}

/**
 * Public read-only Skills & Tools — same specialty grouping as studio CRUD
 * (`specialtyGroupLabel` / `groupBySpecialty`), with unified chip styling.
 */
export function PublicSkillsToolsGrouped({
  skillTags,
  tools,
  allowedSpecialties = [],
}: PublicSkillsToolsGroupedProps) {
  const tags = useMemo(
    () => skillTags.map((tag) => tag.trim()).filter(Boolean),
    [skillTags]
  );
  const normalizedTools = useMemo(
    () =>
      tools
        .map((item) => ({
          name: (typeof item === 'string' ? item : item.name)?.trim() ?? '',
          category: typeof item === 'string' ? null : item.category,
          iconUrl: typeof item === 'string' ? null : item.iconUrl,
        }))
        .filter((item) => item.name),
    [tools]
  );

  const toolGroups = useMemo(
    () => groupBySpecialty(normalizedTools, (item) => item.category, allowedSpecialties),
    [normalizedTools, allowedSpecialties]
  );

  if (tags.length === 0 && normalizedTools.length === 0) return null;

  return (
    <div className="space-y-5">
      {tags.length > 0 ? (
        <section className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((label) => (
              <MetaChip key={label} label={label} />
            ))}
          </div>
        </section>
      ) : null}

      {normalizedTools.length > 0 ? (
        <section className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Tools
          </p>
          <div className="space-y-2.5">
            {toolGroups.map(({ group, items }) => (
              <SpecialtyGroup key={group} title={group} defaultOpen={toolGroups.length <= 2}>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <MetaChip
                      key={`${group}-${item.name}`}
                      label={item.name}
                      iconUrl={item.iconUrl}
                      showLogo
                    />
                  ))}
                </div>
              </SpecialtyGroup>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
