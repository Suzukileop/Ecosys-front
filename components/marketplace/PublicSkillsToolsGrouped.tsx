'use client';

import { useMemo, type ReactNode } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { groupBySpecialty } from '@/lib/specialties';
import type { ProfileStrengthTool } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

type PublicSkillsToolsGroupedProps = {
  /** Rich stack items (preferred). */
  stack?: ProfileStrengthTool[];
  /** Legacy plain tags — shown only when `stack` is empty. */
  skillTags?: string[];
  tools: ProfileStrengthTool[];
  allowedSpecialties?: string[];
  /** Title each block ("Stack", "Tools"). Off where the surrounding section already names it. */
  showRowLabels?: boolean;
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
      className={`inline-flex h-9 max-w-full items-center gap-2 rounded-full bg-[color:var(--gn-inset)] text-[14px] font-medium text-[#0F1419] dark:text-[#E7E9EA] ${
        showLogo ? 'pl-2 pr-3' : 'px-3'
      }`}
      title={label}
    >
      {showLogo ? <CreatorToolLogo label={label} iconUrl={iconUrl} size={20} /> : null}
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}

function SkillRow({ label, showLabel = true, children }: { label: string; showLabel?: boolean; children: ReactNode }) {
  return (
    <div className="gn-card -mx-4 rounded-none bg-[#F7F9F9] dark:bg-[#16181C] px-4 py-5 sm:mx-0 sm:p-6">
      {showLabel ? <p className="mb-4 text-[17px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">{label}</p> : null}
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
  showRowLabels = true,
}: PublicSkillsToolsGroupedProps) {
  const t = useT();
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
    <div className="space-y-2 sm:space-y-6">
      {hasStack ? (
        <SkillRow label={t('Stack')} showLabel={showRowLabels}>
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
        <SkillRow label={t('Tools')} showLabel={showRowLabels}>
          <div className="space-y-5">
            {toolGroups.map(({ group, items }) => (
              <div key={group}>
                {group ? (
                  <p className="mb-2 text-[13px] capitalize text-[#536471] dark:text-[#71767B]">
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
