'use client';

import { useState, type ReactNode } from 'react';
import { ContentMediaPreview } from '@/components/creator/creator-content-media';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_ROW_RULE,
  STUDIO_VALUE_CLASS,
  StudioIconAction,
  StudioSlashLine,
} from '@/components/portfolio/PortfolioStudioKit';
import { employmentTypeLabel } from '@/lib/experience-employment';
import type { ProfileMediaBlock } from '@/types/ecosystem';

const SECONDARY_CLASS = 'text-[15px] text-neutral-600 dark:text-neutral-300';

type ExperienceTool = { name: string; iconUrl: string | null };

function normalizeTools(block: ProfileMediaBlock): ExperienceTool[] {
  const seen = new Set<string>();
  const tools: ExperienceTool[] = [];
  for (const item of block.tools ?? []) {
    const name =
      typeof item === 'string' ? item.trim() : String(item?.name ?? item?.value ?? '').trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const iconUrl = typeof item === 'object' && item?.iconUrl?.trim() ? item.iconUrl.trim() : null;
    tools.push({ name, iconUrl });
  }
  return tools;
}

function normalizeTasks(block: ProfileMediaBlock): string[] {
  return (block.tasks ?? [])
    .map((task) =>
      typeof task === 'string' ? task.trim() : String((task as { value?: string })?.value ?? '').trim()
    )
    .filter(Boolean);
}

function linkHostname(url: string): string {
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(withProtocol).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function hasContent(block: ProfileMediaBlock): boolean {
  return Boolean(
    block.title?.trim() ||
      block.organization?.trim() ||
      block.period?.trim() ||
      block.text?.trim() ||
      block.location?.trim() ||
      block.mediaUrl?.trim() ||
      normalizeTasks(block).length ||
      normalizeTools(block).length ||
      (block.links ?? []).some((link) => link.url?.trim())
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={`min-w-0 pb-3 ${STUDIO_ROW_RULE}`}>
      <p className="mb-2.5 text-[15px] font-bold text-[#111111] dark:text-neutral-300">{label}</p>
      {children}
    </div>
  );
}

function Value({ children }: { children: ReactNode }) {
  return children ? (
    <p className={`break-words ${STUDIO_VALUE_CLASS}`}>{children}</p>
  ) : (
    <p className="text-base text-neutral-500 dark:text-neutral-400">—</p>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="min-w-0">
      <h4 className="mb-4 text-[15px] font-bold text-[#111111] dark:text-neutral-200">{label}</h4>
      {children}
    </section>
  );
}

function ExperienceEntry({ block }: { block: ProfileMediaBlock }) {
  const status =
    block.status === 'ONGOING' ? 'Ongoing' : block.status === 'FINISHED' ? 'Finished' : null;
  const employment = employmentTypeLabel(block.employmentType);
  const tasks = normalizeTasks(block);
  const tools = normalizeTools(block);
  const links = (block.links ?? []).filter((link) => link.url?.trim());
  const mediaUrl = block.mediaUrl?.trim();

  return (
    <div style={STUDIO_FLOAT_IN_STYLE} role="tabpanel" className="space-y-12">
      <div className="space-y-10">
        <div className="grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <Field label="Job title">
            <Value>{block.title?.trim()}</Value>
          </Field>
          <Field label="Status">
            {status ? (
              <span className="inline-flex items-center gap-2 text-base text-[#111111] dark:text-neutral-100">
                {status === 'Ongoing' ? (
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                ) : null}
                {status}
              </span>
            ) : (
              <Value>{null}</Value>
            )}
          </Field>
        </div>
        <div className="grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-3">
          <Field label="Period">
            <Value>{block.period?.trim() ? <span className="tabular-nums">{block.period.trim()}</span> : null}</Value>
          </Field>
          <Field label="Organization">
            <Value>{block.organization?.trim()}</Value>
          </Field>
          <Field label="Location">
            <Value>{block.location?.trim()}</Value>
          </Field>
        </div>
        {employment ? (
          <Field label="Employment">
            <Value>{employment}</Value>
          </Field>
        ) : null}
        {block.text?.trim() ? (
          <Field label="Description">
            <p className={`whitespace-pre-line leading-relaxed ${STUDIO_VALUE_CLASS}`}>{block.text.trim()}</p>
          </Field>
        ) : null}
      </div>

      {tasks.length > 0 ? (
        <Block label="Tasks">
          <ul>
            {tasks.map((task, index) => (
              <li key={`${index}-${task}`} className={`flex items-baseline py-3 first:pt-0 ${STUDIO_ROW_RULE}`}>
                <span aria-hidden className="mr-3 select-none text-neutral-400">
                  —
                </span>
                <span className={`leading-relaxed ${STUDIO_VALUE_CLASS}`}>{task}</span>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {tools.length > 0 ? (
        <Block label="Tools">
          <div className={STUDIO_ROW_RULE}>
            <StudioSlashLine
              items={tools.map((tool) => (
                <span key={tool.name} className={`inline-flex items-center gap-2 ${STUDIO_VALUE_CLASS}`}>
                  <CreatorToolLogo label={tool.name} iconUrl={tool.iconUrl} size={18} />
                  {tool.name}
                </span>
              ))}
            />
          </div>
        </Block>
      ) : null}

      {links.length > 0 ? (
        <Block label="Proof link">
          <ul>
            {links.map((link) => (
              <li
                key={link.id}
                className={`grid grid-cols-1 items-baseline gap-x-8 gap-y-1 py-3 first:pt-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] ${STUDIO_ROW_RULE}`}
              >
                <span className={STUDIO_VALUE_CLASS}>{link.label?.trim() || 'Link'}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`truncate underline decoration-transparent underline-offset-4 transition-colors hover:text-[#111111] hover:decoration-neutral-400 dark:hover:text-white ${SECONDARY_CLASS}`}
                >
                  {linkHostname(link.url)} ↗
                </a>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {mediaUrl ? (
        <Block label="Media">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
            <ContentMediaPreview locale="en" mediaUrl={mediaUrl} mediaType="FILE" large fluid fit="cover" />
          </div>
        </Block>
      ) : null}
    </div>
  );
}

export function PublicExperienceShowcase({
  blocks,
  yearsOfExperience,
}: {
  blocks: ProfileMediaBlock[];
  yearsOfExperience?: number | null;
}) {
  const entries = blocks.filter(hasContent);
  const [active, setActive] = useState(0);
  const index = Math.min(active, Math.max(entries.length - 1, 0));
  const entry = entries[index];
  const nameOf = (i: number) =>
    entries[i]?.title?.trim() || entries[i]?.organization?.trim() || `Experience ${i + 1}`;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        {yearsOfExperience != null ? (
          <div>
            <p className="text-[15px] font-bold text-[#111111] dark:text-neutral-300">Years of experience</p>
            <p className={`mt-2 tabular-nums ${STUDIO_VALUE_CLASS}`}>
              {yearsOfExperience} {yearsOfExperience === 1 ? 'year' : 'years'}
            </p>
          </div>
        ) : (
          <span aria-hidden />
        )}
        {entries.length > 1 ? (
          <div role="group" aria-label="Experiences" className="flex items-center gap-2">
            <StudioIconAction
              icon="previous"
              label={index > 0 ? `Previous: ${nameOf(index - 1)}` : 'Previous experience'}
              onClick={() => setActive(index - 1)}
              disabled={index === 0}
            />
            <span
              aria-live="polite"
              title={nameOf(index)}
              className={`min-w-[3.25rem] text-center tabular-nums ${SECONDARY_CLASS}`}
            >
              {index + 1} / {entries.length}
            </span>
            <StudioIconAction
              icon="next"
              label={index < entries.length - 1 ? `Next: ${nameOf(index + 1)}` : 'Next experience'}
              onClick={() => setActive(index + 1)}
              disabled={index >= entries.length - 1}
            />
          </div>
        ) : null}
      </div>

      {entry ? <ExperienceEntry key={entry.id} block={entry} /> : null}
    </div>
  );
}
