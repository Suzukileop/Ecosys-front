import type { ReactNode } from 'react';
import {
  DEFAULT_ATS_DENSITY,
  resolveCvLabel,
  type AtsDensity,
  type AtsVariantId,
  type CvData,
  type CvSectionId,
  type CvSectionLabels,
  type CvTemplateId,
} from '@/lib/cv-data';

type LabelFor = (id: CvSectionId) => string;

/** A4 sheet — sized in mm so screen preview and print match. */
const SHEET_CLASS =
  'cv-sheet mx-auto w-[210mm] min-h-[297mm] bg-white text-[#111111] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] print:shadow-none';

const joinDot = (parts: Array<string | null | undefined>) => parts.filter(Boolean).join('  ·  ');

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/* ------------------------------------------------------------------ */
/* ATS friendly — single column, real text, standard fonts, no tables, */
/* icons or images. Four variants share one renderer; each sets its    */
/* own type scale and a tight vertical rhythm so a profile fits on A4. */
/* ------------------------------------------------------------------ */

type AtsStyle = {
  sheet: string;
  /** Kept out of `sheet` so a density can replace it. */
  leading: string;
  header: string;
  /** `split`: name left, headline right on the same row, with a rule under the contact line. */
  headerLayout?: 'stack' | 'split';
  /** Joins skills, languages and interests. */
  listSeparator: string;
  name: string;
  headline: string;
  contact: string;
  contactSeparator: string;
  contactSeparatorClass?: string;
  section: string;
  heading: 'rule-after' | 'rule-below' | 'rule-soft' | 'band';
  headingText: string;
  body: string;
  entries: string;
  /** Vertical rhythm only; indentation lives in `bulletIndent`. */
  bullets: string;
  bulletIndent?: string;
  /**
   * `inline`: Role · Company · Place | dates. `caps`: ROLE | Company | Place | dates.
   * `harvard`: organization first. `stacked`: role line, then Company | dates.
   */
  entry: 'inline' | 'caps' | 'harvard' | 'stacked';
  /** `grid`: skills flow into four columns instead of one separated line. */
  skillsLayout?: 'inline' | 'grid';
  educationFirst?: boolean;
  muted: string;
};

const ATS_STYLES: Record<AtsVariantId, AtsStyle> = {
  classic: {
    sheet:
      "px-[16mm] py-[14mm] font-[Calibri,Carlito,'Segoe_UI',Helvetica,Arial,sans-serif] text-[10.5pt]",
    leading: 'leading-[1.35]',
    header: '',
    listSeparator: ', ',
    name: 'text-[22pt] font-bold leading-none tracking-[-0.02em]',
    headline: 'mt-[4pt] text-[11.5pt] text-[#333333]',
    contact: 'mt-[5pt] text-[9.5pt] text-[#5A5A5A]',
    contactSeparator: '  |  ',
    section: 'mt-[12pt]',
    heading: 'rule-after',
    headingText: 'text-[9.5pt] font-bold uppercase tracking-[0.14em]',
    body: 'mt-[5pt]',
    entries: 'space-y-[8pt]',
    bullets: 'mt-[2pt] space-y-[1pt]',
    entry: 'inline',
    muted: 'text-[#5A5A5A]',
  },
  compact: {
    sheet: 'px-[12mm] py-[11mm] font-[Arial,Helvetica,sans-serif] text-[9.75pt]',
    leading: 'leading-[1.3]',
    header: '',
    listSeparator: ', ',
    name: 'text-[18pt] font-bold leading-none',
    headline: 'mt-[3pt] text-[10.5pt] text-[#333333]',
    contact: 'mt-[3pt] text-[9pt] text-[#444444]',
    contactSeparator: '  |  ',
    section: 'mt-[8pt]',
    heading: 'rule-below',
    headingText: 'text-[9.5pt] font-bold uppercase tracking-[0.08em]',
    body: 'mt-[3pt]',
    entries: 'space-y-[5pt]',
    bullets: 'mt-[1pt]',
    entry: 'inline',
    muted: 'text-[#444444]',
  },
  harvard: {
    sheet: "px-[18mm] py-[15mm] font-[Georgia,'Times_New_Roman',Times,serif] text-[10.5pt]",
    leading: 'leading-[1.3]',
    header: 'text-center',
    listSeparator: ', ',
    name: 'text-[19pt] font-bold leading-none tracking-[0.01em]',
    headline: 'mt-[4pt] text-[10.5pt] italic text-[#333333]',
    contact: 'mt-[4pt] text-[9.5pt] text-[#333333]',
    contactSeparator: '  •  ',
    section: 'mt-[11pt]',
    heading: 'rule-below',
    headingText: 'text-[10.5pt] font-bold uppercase tracking-[0.06em]',
    body: 'mt-[4pt]',
    entries: 'space-y-[7pt]',
    bullets: 'mt-[2pt] space-y-[1pt]',
    entry: 'harvard',
    muted: 'text-[#333333]',
  },
  banded: {
    sheet: "px-[14mm] py-[12mm] font-[Calibri,Carlito,'Segoe_UI',Helvetica,Arial,sans-serif] text-[10pt]",
    leading: 'leading-[1.3]',
    header: '',
    headerLayout: 'split',
    listSeparator: ' | ',
    name: 'text-[22pt] font-bold uppercase leading-none tracking-[0.01em]',
    headline: 'text-[11pt] text-[#333333]',
    contact: 'mt-[5pt] border-b border-[#111111] pb-[3pt] text-[9.5pt] text-[#222222]',
    contactSeparator: ' | ',
    section: 'mt-[8pt]',
    heading: 'band',
    headingText: 'text-[11pt] font-bold uppercase tracking-[0.04em]',
    body: 'mt-[4pt]',
    entries: 'space-y-[7pt]',
    bullets: 'mt-[2pt] space-y-[1pt]',
    entry: 'caps',
    muted: 'text-[#222222]',
  },
  signature: {
    sheet:
      "px-[16mm] py-[15mm] font-[Calibri,Carlito,'Segoe_UI',Helvetica,Arial,sans-serif] text-[9.75pt] text-[#333333]",
    leading: 'leading-[1.4]',
    header: '',
    listSeparator: ' | ',
    name: "font-[Georgia,'Times_New_Roman',Times,serif] text-[28pt] font-normal uppercase leading-none tracking-[0.14em] text-[#3A3A3A]",
    headline: 'mt-[8pt] text-[8.5pt] uppercase tracking-[0.32em] text-[#3A3A3A]',
    contact:
      'mt-[12pt] bg-[#595959] px-[9pt] py-[4.5pt] text-[9pt] text-white [print-color-adjust:exact] [-webkit-print-color-adjust:exact]',
    contactSeparator: '  |  ',
    contactSeparatorClass: 'text-white/70',
    section: 'mt-[13pt]',
    heading: 'rule-soft',
    headingText: 'text-[10pt] font-bold uppercase tracking-[0.02em] text-[#3A3A3A]',
    body: 'mt-[7pt]',
    entries: 'space-y-[9pt]',
    bullets: 'mt-[3pt] space-y-[1.5pt]',
    bulletIndent: 'pl-[1.6em]',
    entry: 'stacked',
    skillsLayout: 'grid',
    educationFirst: true,
    muted: 'text-[#333333]',
  },
};

type DensityOverrides = Pick<AtsStyle, 'leading' | 'section' | 'body' | 'entries' | 'bullets'>;

const ATS_DENSITY_OVERRIDES: Record<Exclude<AtsDensity, 'medium'>, DensityOverrides> = {
  tight: {
    leading: 'leading-[1.25]',
    section: 'mt-[7pt]',
    body: 'mt-[3pt]',
    entries: 'space-y-[5pt]',
    bullets: 'mt-[1pt] space-y-0',
  },
  airy: {
    leading: 'leading-[1.5]',
    section: 'mt-[17pt]',
    body: 'mt-[8pt]',
    entries: 'space-y-[12pt]',
    bullets: 'mt-[4pt] space-y-[2.5pt]',
  },
  spacious: {
    leading: 'leading-[1.6]',
    section: 'mt-[22pt]',
    body: 'mt-[10pt]',
    entries: 'space-y-[15pt]',
    bullets: 'mt-[5pt] space-y-[3.5pt]',
  },
};

function AtsSection({ style, title, children }: { style: AtsStyle; title: string; children: ReactNode }) {
  const heading =
    style.heading === 'rule-after' ? (
      <h2 className={`flex items-center gap-3 ${style.headingText}`}>
        {title}
        <span aria-hidden className="h-px flex-1 bg-[#D9D9D9]" />
      </h2>
    ) : style.heading === 'rule-below' ? (
      <h2 className={`border-b border-[#111111] pb-[2pt] ${style.headingText}`}>{title}</h2>
    ) : style.heading === 'rule-soft' ? (
      <h2 className={`border-b border-[#8C8C8C] pb-[3pt] ${style.headingText}`}>{title}</h2>
    ) : (
      <h2
        className={`bg-[#D9EAD3] py-[2pt] text-center [print-color-adjust:exact] [-webkit-print-color-adjust:exact] ${style.headingText}`}
      >
        {title}
      </h2>
    );
  return (
    <section className={`${style.section} break-inside-avoid-page`}>
      {heading}
      <div className={style.body}>{children}</div>
    </section>
  );
}

/** Two ends of one line: content left, a date or place pushed right. */
function AtsLine({ left, right, rightClass }: { left: ReactNode; right?: string; rightClass: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <p className="min-w-0">{left}</p>
      {right ? <p className={`shrink-0 tabular-nums ${rightClass}`}>{right}</p> : null}
    </div>
  );
}

function AtsEntryHeader({
  style,
  title,
  organization,
  location,
  period,
}: {
  style: AtsStyle;
  title: string;
  organization: string;
  location: string;
  period: string;
}) {
  if (style.entry === 'harvard') {
    return (
      <>
        <AtsLine left={<span className="font-bold">{organization || title}</span>} right={location} rightClass="" />
        {organization && title ? (
          <AtsLine left={<span className="italic">{title}</span>} right={period} rightClass="italic" />
        ) : period ? (
          <AtsLine left={null} right={period} rightClass="italic" />
        ) : null}
      </>
    );
  }
  if (style.entry === 'stacked') {
    const place = [organization, location].filter(Boolean).join(' | ');
    return (
      <>
        {title ? <p className="tracking-[0.08em] text-[#3A3A3A]">{title}</p> : null}
        {place || period ? (
          <AtsLine left={place} right={period} rightClass={`tracking-[0.06em] ${style.muted}`} />
        ) : null}
      </>
    );
  }
  if (style.entry === 'caps') {
    const tail = [title ? organization : '', location].filter(Boolean);
    return (
      <AtsLine
        left={
          <>
            <span className="font-bold uppercase">{title || organization}</span>
            {tail.map((part, index) => (
              <span key={`${part}-${index}`}> | {part}</span>
            ))}
          </>
        }
        right={period}
        rightClass={style.muted}
      />
    );
  }
  const tail = [title ? organization : '', location].filter(Boolean);
  return (
    <AtsLine
      left={
        <>
          <span className="font-bold">{title || organization}</span>
          {tail.map((part, index) => (
            <span key={`${part}-${index}`} className={index === 0 ? '' : style.muted}>
              <span className="text-[#A0A0A0]"> · </span>
              {part}
            </span>
          ))}
        </>
      }
      right={period}
      rightClass={style.muted}
    />
  );
}

function AtsCv({
  data,
  variant,
  density,
  label,
}: {
  data: CvData;
  variant: AtsVariantId;
  density: AtsDensity;
  label: LabelFor;
}) {
  const style: AtsStyle =
    density === 'medium' ? ATS_STYLES[variant] : { ...ATS_STYLES[variant], ...ATS_DENSITY_OVERRIDES[density] };
  const contact = [data.email, data.phone, data.location, ...data.links.map((link) => link.url)].filter(Boolean);
  const languages = data.languages
    .map((language) => (language.level ? `${language.name} (${language.level})` : language.name))
    .join(style.listSeparator);
  const interests = data.interests.join(style.listSeparator);
  const hasSkillsBlock = data.skills.length > 0 || languages || interests;
  const experienceBlock = <AtsExperienceBlock data={data} style={style} title={label('experience')} />;
  const educationBlock = <AtsEducationBlock data={data} style={style} title={label('education')} />;

  return (
    <article className={`${SHEET_CLASS} ${style.sheet} ${style.leading}`}>
      <header className={style.header}>
        {style.headerLayout === 'split' ? (
          <div className="flex items-end justify-between gap-6">
            <h1 className={`min-w-0 ${style.name}`}>{data.fullName}</h1>
            {data.headline ? <p className={`max-w-[45%] text-right ${style.headline}`}>{data.headline}</p> : null}
          </div>
        ) : (
          <>
            <h1 className={style.name}>{data.fullName}</h1>
            {data.headline ? <p className={style.headline}>{data.headline}</p> : null}
          </>
        )}
        {contact.length > 0 ? (
          <p className={style.contact}>
            {contact.map((line, index) => (
              <span key={line}>
                {index > 0 ? (
                  <span className={`whitespace-pre ${style.contactSeparatorClass ?? 'text-[#9A9A9A]'}`}>
                    {style.contactSeparator}
                  </span>
                ) : null}
                {line}
              </span>
            ))}
          </p>
        ) : null}
      </header>

      {data.summary ? (
        <AtsSection style={style} title={label('summary')}>
          <p className="text-[#222222]">{data.summary}</p>
        </AtsSection>
      ) : null}

      {style.educationFirst ? (
        <>
          {educationBlock}
          {experienceBlock}
        </>
      ) : (
        <>
          {experienceBlock}
          {educationBlock}
        </>
      )}

      {hasSkillsBlock ? (
        <AtsSection style={style} title={label('skills')}>
          <div className="space-y-[2pt] text-[#222222]">
            {data.skills.length > 0 ? (
              style.skillsLayout === 'grid' ? (
                <ul className="grid grid-cols-4 gap-x-[10pt] gap-y-[1pt]">
                  {data.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p>{data.skills.join(style.listSeparator)}</p>
              )
            ) : null}
            {languages ? (
              <p className={style.skillsLayout === 'grid' ? 'pt-[3pt]' : ''}>
                <span className="font-bold text-[#111111]">{label('languages')}: </span>
                {languages}
              </p>
            ) : null}
            {interests ? (
              <p>
                <span className="font-bold text-[#111111]">{label('interests')}: </span>
                {interests}
              </p>
            ) : null}
          </div>
        </AtsSection>
      ) : null}
    </article>
  );
}

function AtsExperienceBlock({ data, style, title }: { data: CvData; style: AtsStyle; title: string }) {
  if (data.experiences.length === 0) return null;
  return (
    <AtsSection style={style} title={title}>
      <div className={style.entries}>
        {data.experiences.map((entry, index) => (
          <div key={`${entry.title}-${index}`} className="break-inside-avoid">
            <AtsEntryHeader
              style={style}
              title={entry.title}
              organization={entry.organization}
              location={entry.location}
              period={entry.period}
            />
            {entry.summary ? <p className="mt-[2pt] text-[#222222]">{entry.summary}</p> : null}
            {entry.tasks.length > 0 ? (
              <ul className={`list-disc ${style.bulletIndent ?? 'pl-[1.1em]'} text-[#222222] marker:text-[#6A6A6A] ${style.bullets}`}>
                {entry.tasks.map((task) => (
                  <li key={task} className="pl-[2pt]">
                    {task}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </AtsSection>
  );
}

function AtsEducationBlock({ data, style, title }: { data: CvData; style: AtsStyle; title: string }) {
  if (data.education.length === 0) return null;
  return (
    <AtsSection style={style} title={title}>
      <div className={style.entry === 'harvard' ? style.entries : 'space-y-[3pt]'}>
        {data.education.map((entry, index) =>
          style.entry === 'stacked' ? (
            <AtsLine
              key={`${entry.title}-${index}`}
              left={[entry.title, entry.institution].filter(Boolean).join(style.listSeparator)}
              right={entry.period}
              rightClass={style.muted}
            />
          ) : style.entry === 'harvard' ? (
            <div key={`${entry.title}-${index}`}>
              <AtsLine
                left={<span className="font-bold">{entry.institution || entry.title}</span>}
                right={entry.period}
                rightClass="italic"
              />
              {entry.institution && entry.title ? <p className="italic">{entry.title}</p> : null}
            </div>
          ) : (
            <AtsEntryHeader
              key={`${entry.title}-${index}`}
              style={style}
              title={entry.title}
              organization={entry.institution}
              location=""
              period={entry.period}
            />
          ),
        )}
      </div>
    </AtsSection>
  );
}

/* ------------------------------------------------------------------ */
/* Modern — dark side panel with photo, contact, skills and languages. */
/* ------------------------------------------------------------------ */

function ModernSideBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-[8pt] font-semibold uppercase tracking-[0.2em] text-white/50">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ModernMainBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="flex items-center gap-3 text-[8.5pt] font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
        {title}
        <span className="h-px flex-1 bg-black/[0.08]" />
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ModernCv({ data, label }: { data: CvData; label: LabelFor }) {
  return (
    <article className={`${SHEET_CLASS} grid grid-cols-[72mm_minmax(0,1fr)] font-sans text-[9.5pt] leading-[1.55]`}>
      <aside className="bg-[#111111] px-[9mm] py-[14mm] text-white [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
        <div className="mx-auto h-[38mm] w-[38mm] overflow-hidden rounded-full bg-white/10">
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[22pt] font-semibold">
              {initials(data.fullName)}
            </span>
          )}
        </div>

        <ModernSideBlock title={label('contact')}>
          <ul className="space-y-2 break-words text-white/85">
            {[data.email, data.phone, data.location, ...data.links.map((link) => link.url)]
              .filter(Boolean)
              .map((line) => (
                <li key={line}>{line}</li>
              ))}
          </ul>
        </ModernSideBlock>

        {data.skills.length > 0 ? (
          <ModernSideBlock title={label('skills')}>
            <ul className="space-y-1.5 text-white/85">
              {data.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </ModernSideBlock>
        ) : null}

        {data.languages.length > 0 ? (
          <ModernSideBlock title={label('languages')}>
            <ul className="space-y-1.5">
              {data.languages.map((language) => (
                <li key={language.name} className="flex justify-between gap-3">
                  <span className="text-white/90">{language.name}</span>
                  {language.level ? <span className="text-white/50">{language.level}</span> : null}
                </li>
              ))}
            </ul>
          </ModernSideBlock>
        ) : null}
      </aside>

      <main className="px-[11mm] py-[14mm]">
        <header className="mb-10">
          <h1 className="text-[26pt] font-bold leading-[1.05] tracking-[-0.02em]">{data.fullName}</h1>
          {data.headline ? <p className="mt-2 text-[11pt] text-[#555555]">{data.headline}</p> : null}
          {data.summary ? <p className="mt-5 text-[10pt] leading-[1.6] text-[#333333]">{data.summary}</p> : null}
        </header>

        {data.experiences.length > 0 ? (
          <ModernMainBlock title={label('experience')}>
            <div className="space-y-6">
              {data.experiences.map((entry, index) => (
                <div key={`${entry.title}-${index}`} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[10.5pt] font-semibold">{entry.title || entry.organization}</p>
                    {entry.period ? <p className="shrink-0 text-[8.5pt] text-[#777777]">{entry.period}</p> : null}
                  </div>
                  {entry.title && entry.organization ? (
                    <p className="text-[#555555]">{joinDot([entry.organization, entry.location])}</p>
                  ) : null}
                  {entry.summary ? <p className="mt-1.5 text-[#333333]">{entry.summary}</p> : null}
                  {entry.tasks.length > 0 ? (
                    <ul className="mt-1.5 space-y-1 text-[#333333]">
                      {entry.tasks.map((task) => (
                        <li key={task} className="flex gap-2.5">
                          <span className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-[#FF5722]" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </ModernMainBlock>
        ) : null}

        {data.education.length > 0 ? (
          <ModernMainBlock title={label('education')}>
            <div className="space-y-3">
              {data.education.map((entry, index) => (
                <div key={`${entry.title}-${index}`} className="grid grid-cols-[22mm_minmax(0,1fr)] gap-3">
                  <p className="text-[8.5pt] text-[#777777]">{entry.period}</p>
                  <div>
                    <p className="font-semibold">{entry.title}</p>
                    {entry.institution ? <p className="text-[#555555]">{entry.institution}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </ModernMainBlock>
        ) : null}
      </main>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Editorial — oversized name, airy grid, orange accent rule.           */
/* ------------------------------------------------------------------ */

function EditorialRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-[38mm_minmax(0,1fr)] gap-6 border-t border-black/[0.1] py-6 break-inside-avoid-page">
      <h2 className="text-[8.5pt] font-semibold uppercase tracking-[0.18em] text-[#888888]">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function EditorialCv({ data, label }: { data: CvData; label: LabelFor }) {
  const contact = [data.email, data.phone, data.location, ...data.links.map((link) => link.url)].filter(Boolean);
  return (
    <article className={`${SHEET_CLASS} px-[20mm] py-[18mm] font-sans text-[9.5pt] leading-[1.6]`}>
      <header className="pb-10">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <span className="block h-[3px] w-12 bg-[#FF5722] [print-color-adjust:exact] [-webkit-print-color-adjust:exact]" />
            <h1 className="mt-6 text-[34pt] font-bold leading-[0.95] tracking-[-0.04em]">{data.fullName}</h1>
            {data.headline ? <p className="mt-4 text-[12pt] text-[#555555]">{data.headline}</p> : null}
          </div>
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatarUrl} alt="" className="h-[30mm] w-[30mm] shrink-0 rounded-2xl object-cover" />
          ) : null}
        </div>
        {contact.length > 0 ? (
          <p className="mt-7 flex flex-wrap gap-x-5 gap-y-1 text-[9pt] text-[#555555]">
            {contact.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        ) : null}
      </header>

      {data.summary ? (
        <EditorialRow title={label('summary')}>
          <p className="text-[11pt] leading-[1.6] text-[#222222]">{data.summary}</p>
        </EditorialRow>
      ) : null}

      {data.experiences.length > 0 ? (
        <EditorialRow title={label('experience')}>
          <div className="space-y-6">
            {data.experiences.map((entry, index) => (
              <div key={`${entry.title}-${index}`} className="break-inside-avoid">
                <p className="text-[8.5pt] uppercase tracking-[0.12em] text-[#888888]">
                  {joinDot([entry.period, entry.location])}
                </p>
                <p className="mt-1 text-[11pt] font-semibold">
                  {entry.title || entry.organization}
                  {entry.title && entry.organization ? (
                    <span className="font-normal text-[#555555]"> — {entry.organization}</span>
                  ) : null}
                </p>
                {entry.summary ? <p className="mt-1.5 text-[#333333]">{entry.summary}</p> : null}
                {entry.tasks.length > 0 ? (
                  <ul className="mt-1.5 space-y-1 text-[#333333]">
                    {entry.tasks.map((task) => (
                      <li key={task} className="flex gap-3">
                        <span className="mt-[0.8em] h-px w-3 shrink-0 bg-[#FF5722]" />
                        {task}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </EditorialRow>
      ) : null}

      {data.education.length > 0 ? (
        <EditorialRow title={label('education')}>
          <div className="space-y-3">
            {data.education.map((entry, index) => (
              <div key={`${entry.title}-${index}`}>
                <p className="font-semibold">{entry.title}</p>
                <p className="text-[#555555]">{joinDot([entry.institution, entry.period])}</p>
              </div>
            ))}
          </div>
        </EditorialRow>
      ) : null}

      {data.skills.length > 0 ? (
        <EditorialRow title={label('skills')}>
          <p className="text-[#222222]">{data.skills.join('  /  ')}</p>
        </EditorialRow>
      ) : null}

      {data.languages.length > 0 ? (
        <EditorialRow title={label('languages')}>
          <p className="text-[#222222]">
            {data.languages.map((language, index) => (
              <span key={language.name}>
                {index > 0 ? <span className="text-[#BBBBBB]"> / </span> : null}
                {language.name}
                {language.level ? <span className="text-[#888888]"> {language.level}</span> : null}
              </span>
            ))}
          </p>
        </EditorialRow>
      ) : null}
    </article>
  );
}

export function CvDocument({
  template,
  atsVariant = 'classic',
  atsDensity = DEFAULT_ATS_DENSITY,
  labels = {},
  data,
}: {
  template: CvTemplateId;
  atsVariant?: AtsVariantId;
  atsDensity?: AtsDensity;
  labels?: CvSectionLabels;
  data: CvData;
}) {
  const label: LabelFor = (id) => resolveCvLabel(labels, template, atsVariant, id);
  switch (template) {
    case 'modern':
      return <ModernCv data={data} label={label} />;
    case 'editorial':
      return <EditorialCv data={data} label={label} />;
    case 'ats':
    default:
      return <AtsCv data={data} variant={atsVariant} density={atsDensity} label={label} />;
  }
}
