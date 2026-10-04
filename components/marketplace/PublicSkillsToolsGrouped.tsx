'use client';

import { useMemo, type ReactNode } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { groupBySpecialty } from '@/lib/specialties';
import type { ProfileStrengthTool } from '@/types/ecosystem';

type PublicSkillsToolsGroupedProps = {
  /** Rich stack items (preferred). */
  stack?: ProfileStrengthTool[];
  /** Legacy plain tags — shown only when `stack` is empty. */
  skillTags?: string[];
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
      className={`inline-flex h-10 max-w-full items-center gap-2 rounded-lg border border-black/[0.08] text-[15px] text-[#111111] transition-colors hover:border-black/[0.18] dark:border-white/[0.1] dark:text-neutral-100 dark:hover:border-white/[0.22] ${
        showLogo ? 'pl-2 pr-3' : 'px-3'
      }`}
      title={label}
    >
      {showLogo ? <CreatorToolLogo label={label} iconUrl={iconUrl} size={20} /> : null}
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}

function SkillRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-black/[0.06] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111111] sm:p-8">
      <p className="mb-5 text-[15px] font-semibold text-[#111111] dark:text-white">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ChipList({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

/**
 * Public read-only Stack & Tools — tools keep the studio specialty grouping
 * (`groupBySpecialty`), proficiency levels are intentionally hidden.
 */
export function PublicSkillsToolsGrouped({
  stack = [],
  skillTags = [],
  tools,
  allowedSpecialties = [],
}: PublicSkillsToolsGroupedProps) {
  const normalizedStack = useMemo(
    () =>
      stack
        .map((item) => ({
          name: (typeof item === 'string' ? item : item.name)?.trim() ?? '',
          iconUrl: typeof item === 'string' ? null : item.iconUrl,
        }))
        .filter((item) => item.name),
    [stack]
  );

  const legacyTags = useMemo(
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

  const hasStack = normalizedStack.length > 0 || legacyTags.length > 0;

  if (!hasStack && normalizedTools.length === 0) return null;

  return (
    <div className="space-y-8">
      {hasStack ? (
        <SkillRow label="Stack">
          <ChipList>
            {normalizedStack.length > 0
              ? normalizedStack.map((item) => (
                  <MetaChip key={item.name} label={item.name} iconUrl={item.iconUrl} showLogo />
                ))
              : legacyTags.map((label) => <MetaChip key={label} label={label} />)}
          </ChipList>
        </SkillRow>
      ) : null}

      {normalizedTools.length > 0 ? (
        <SkillRow label="Tools">
          <div className="space-y-6">
            {toolGroups.map(({ group, items }) => (
              <div key={group}>
                {group ? (
                  <p className="mb-3 text-[15px] capitalize text-neutral-700 dark:text-neutral-300">
                    {group.toLowerCase()}
                  </p>
                ) : null}
                <ChipList>
                  {items.map((item) => (
                    <MetaChip
                      key={`${group}-${item.name}`}
                      label={item.name}
                      iconUrl={item.iconUrl}
                      showLogo
                    />
                  ))}
                </ChipList>
              </div>
            ))}
          </div>
        </SkillRow>
      ) : null}
    </div>
  );
}
