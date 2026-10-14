'use client';

import { useState, type ReactNode } from 'react';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import { ALL_ICON, INTEREST_ICONS, RailGlyph } from '@/components/home/NewsDiscoverRail';
import { SERVICE_PROVIDER_CATEGORY_GROUPS, SERVICE_PROVIDER_POPULAR_TAGS } from '@/lib/service-provider-categories';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/*
 * The Providers directory's rail, built from the News rail's vocabulary (NewsDiscoverRail): outlined
 * `.gn-rail-box` boxes with a bold 20px title over 48px trend rows, the 20px stroke glyphs, the fill
 * tone only under the pointer, the selected row in bold with a check. No hairline between rows.
 */

/** Glyphs for the specialties News does not offer as interests, drawn on the same 24-unit grid. */
const EXTRA_ICONS: Record<string, ReactNode> = {
  /* A tag. */
  Branding: (
    <>
      <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0z" />
      <circle cx="8" cy="8" r="1.3" />
    </>
  ),
  /* Two beamed notes. */
  Music: (
    <>
      <path d="M9 18V5.5l11-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </>
  ),
  /* A pen nib. */
  Illustration: (
    <>
      <path d="m12 19 7-7 3 3-7 7z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18z" />
      <path d="m2 2 7.6 7.6" />
      <circle cx="11" cy="11" r="2" />
    </>
  ),
  /* A cube. */
  '3D': (
    <>
      <path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z" />
      <path d="m4 7.4 8 4.6 8-4.6" />
      <path d="M12 12v9.2" />
    </>
  ),
  /* A bar chart. */
  'Data science': (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M6 17v-6" />
      <path d="M12 17V5" />
      <path d="M18 17v-9" />
    </>
  ),
  /* The DevOps loop. */
  DevOps: (
    <path d="M12 12c-2-2.7-3.6-4-5.5-4a4 4 0 0 0 0 8c1.9 0 3.5-1.3 5.5-4zm0 0c2 2.7 3.6 4 5.5 4a4 4 0 0 0 0-8c-1.9 0-3.5 1.3-5.5 4z" />
  ),
};

const ICON_BY_KEY: Record<string, ReactNode> = Object.fromEntries(
  Object.entries({ ...(INTEREST_ICONS as Record<string, ReactNode>), ...EXTRA_ICONS }).map(([key, icon]) => [
    key.toLowerCase(),
    icon,
  ]),
);

/** The rail glyph for a specialty; a free-typed label ("devops") falls back to a case-blind match. */
export function specialtyIcon(label: string): ReactNode {
  return (
    (INTEREST_ICONS as Record<string, ReactNode>)[label] ??
    EXTRA_ICONS[label] ??
    ICON_BY_KEY[label.trim().toLowerCase()] ??
    null
  );
}

/** Specialties listed in the rail box; the full catalogue opens in the "All specialties" dialog. */
const VISIBLE_SPECIALTIES = 6;

const ROW =
  'flex w-full items-center gap-3 px-6 py-3.5 text-left text-[15px] leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)]';

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** One specialty row; `count` (My services) shows how many items it holds, right-aligned. */
export function SpecialtyRow({
  label,
  icon,
  active,
  onClick,
  count,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-pf-no-color-transition
      className={`${ROW} ${active ? 'font-bold' : 'font-semibold'}`}
    >
      {icon ? <RailGlyph active={active}>{icon}</RailGlyph> : <span aria-hidden className="h-5 w-5 shrink-0" />}
      <span className="min-w-0 flex-1 truncate">{t(label)}</span>
      {count != null && !active ? (
        <span className="shrink-0 text-[13px] font-normal tabular-nums text-[color:var(--gn-ink2)]">{count}</span>
      ) : null}
      {active ? <CheckMark /> : null}
    </button>
  );
}

export const BOX_TITLE = 'px-6 pb-2 pt-1 text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]';

function normalizeForSearch(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Every specialty of the catalogue, in sections: the popular fields, then each category group. */
const SPECIALTY_SECTIONS: { id: string; title: string; items: readonly string[] }[] = [
  { id: 'popular', title: msg('Popular'), items: SERVICE_PROVIDER_POPULAR_TAGS },
  ...SERVICE_PROVIDER_CATEGORY_GROUPS.map((group) => ({ id: group.id, title: group.title, items: group.items })),
];

/*
 * "All specialties" — a centred dialog (a bottom sheet on phones), not an in-place unfold: the rail is
 * sticky and height-locked once pinned, so a list growing inside it was cut off and pushed Refine out
 * of view. Here the whole catalogue gets the room it needs: a search field that stays on top, then each
 * section as a two-column grid. Picking closes the dialog. Portalled outside the News token scope, so
 * colours are literal (the X palette the rest of the page uses).
 */
function AllSpecialtiesDialog({
  open,
  value,
  onClose,
  onPick,
}: {
  open: boolean;
  value: string;
  onClose: () => void;
  onPick: (label: string) => void;
}) {
  const t = useT();
  const [query, setQuery] = useState('');
  const needle = normalizeForSearch(query);
  const sections = SPECIALTY_SECTIONS.map((section) => ({
    ...section,
    items: needle ? section.items.filter((label) => normalizeForSearch(label).includes(needle)) : section.items,
  })).filter((section) => section.items.length > 0);
  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <ContentPostDialogShell open={open} title={t('All specialties')} onClose={close}>
      <div className="px-5 pb-5">
        <div className="sticky top-0 z-[1] bg-white pb-2 pt-1 dark:bg-black">
          <div className="relative">
            <svg className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-[#536471] dark:text-[#8B98A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m2.2-4.8a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('Search a specialty')}
              aria-label={t('Search a specialty')}
              className="h-11 w-full rounded-full border-0 bg-[#EFF3F4] pl-11 pr-4 text-[15px] text-[#0F1419] outline-none placeholder:text-[#536471] focus:bg-white focus:shadow-[inset_0_0_0_2px_#0F1419] dark:bg-[#202327] dark:text-[#E7E9EA] dark:placeholder:text-[#8B98A5] dark:focus:bg-black dark:focus:shadow-[inset_0_0_0_2px_#E7E9EA]"
            />
          </div>
        </div>
        {sections.length === 0 ? (
          <p className="px-3 py-10 text-center text-[15px] text-[#536471] dark:text-[#8B98A5]">
            {t('No specialty matches “{trim}”.', { trim: query.trim() })}
          </p>
        ) : (
          sections.map((section) => (
            <section key={section.id} className="pt-4" aria-label={t(section.title)}>
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#536471] dark:text-[#8B98A5]">
                {t(section.title)}
              </p>
              <ul className="grid grid-cols-1 gap-x-2 sm:grid-cols-2">
                {section.items.map((label) => {
                  const active = value === label;
                  const icon = specialtyIcon(label);
                  return (
                    <li key={label}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setQuery('');
                          onPick(label);
                        }}
                        className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] leading-5 text-[#0F1419] transition-colors hover:bg-[#EFF3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419]/40 dark:text-[#E7E9EA] dark:hover:bg-[#16181C] dark:focus-visible:ring-white/40 ${
                          active ? 'font-bold' : ''
                        }`}
                      >
                        {icon ? <RailGlyph active={active}>{icon}</RailGlyph> : null}
                        <span className="min-w-0 flex-1 truncate">{t(label)}</span>
                        {active ? <CheckMark /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </ContentPostDialogShell>
  );
}

/**
 * "Specialty": All, the six most asked-for fields, then "All specialties" — a dialog with the whole
 * catalogue. A specialty picked there that is not among the six is pinned under "All", so the box
 * always shows what filters the list.
 */
export function ProviderSpecialtyBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string | undefined) => void;
}) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const visible = SERVICE_PROVIDER_POPULAR_TAGS.slice(0, VISIBLE_SPECIALTIES) as readonly string[];
  const pinned = value && !visible.includes(value) ? value : null;
  const pick = (label: string) => onChange(value === label ? undefined : label);

  return (
    <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="providers-specialty-title">
      <h2 id="providers-specialty-title" className={BOX_TITLE}>
        {t('Specialty')}
      </h2>
      <nav aria-label={t('Filter by specialty')} className="flex w-full flex-col">
        <SpecialtyRow label={t('All')} icon={ALL_ICON} active={!value} onClick={() => onChange(undefined)} />
        {pinned ? <SpecialtyRow label={pinned} icon={specialtyIcon(pinned)} active onClick={() => pick(pinned)} /> : null}
        {visible.map((label) => (
          <SpecialtyRow key={label} label={label} icon={specialtyIcon(label)} active={value === label} onClick={() => pick(label)} />
        ))}
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          aria-haspopup="dialog"
          className={`${ROW} group/more !text-[color:var(--gn-ink2)] hover:!text-[color:var(--gn-ink)]`}
        >
          <span className="min-w-0 flex-1 truncate">{t('All specialties')}</span>
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover/more:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </nav>
      <AllSpecialtiesDialog
        open={dialogOpen}
        value={value}
        onClose={() => setDialogOpen(false)}
        onPick={(label) => {
          setDialogOpen(false);
          pick(label);
        }}
      />
    </section>
  );
}

/** One switch row of the Refine box: the label left, a small ink switch right. */
export function ProviderRailSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`${ROW} justify-between ${checked ? 'font-bold' : 'font-semibold'}`}
    >
      <span className="truncate">{t(label)}</span>
      <span
        aria-hidden
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[color:var(--gn-ink)]' : 'bg-[#AAB8C2] dark:bg-[#3E4144]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full shadow-[0_1px_2px_rgba(15,20,25,0.2)] transition-[left] dark:shadow-none ${
            checked ? 'left-[18px] bg-white dark:bg-[#0F1419]' : 'left-0.5 bg-white dark:bg-[#000000]'
          }`}
        />
      </span>
    </button>
  );
}

/** "Refine" box: a title over the rows the caller passes (switches, then the selects). */
export function ProviderRefineBox({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const t = useT();
  return (
    <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="providers-refine-title">
      <h2 id="providers-refine-title" className={BOX_TITLE}>
        {t('Refine')}
      </h2>
      <div className="flex w-full flex-col">{children}</div>
      {footer}
    </section>
  );
}

/**
 * Below lg (no rail): the specialties as a swipeable chip row — the News interest chips: idle chips on
 * the card tone, the selected one solid ink, no outline.
 */
export function ProviderSpecialtyChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string | undefined) => void;
}) {
  const t = useT();
  const chips: { label: string; value: string | undefined }[] = [
    { label: t('All'), value: undefined },
    ...SERVICE_PROVIDER_POPULAR_TAGS.map((label) => ({ label, value: label as string })),
  ];
  /* A specialty picked from the full catalogue (filters sheet) still shows as the selected chip. */
  if (value && !chips.some((chip) => chip.value === value)) chips.splice(1, 0, { label: value, value });
  return (
    <nav
      aria-label={t('Filter by specialty')}
      className="flex gap-2 overflow-x-auto scroll-px-5 px-5 sm:px-0 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {chips.map((chip) => {
        const active = (value || undefined) === chip.value;
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active && chip.value ? undefined : chip.value)}
            data-pf-no-color-transition
            className={`inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[14px] font-semibold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
              active
                ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
                : 'bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] active:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
            }`}
          >
            {t(chip.label)}
          </button>
        );
      })}
    </nav>
  );
}
