'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';

/** Longest first line that still reads as a headline; anything longer stays body text. */
const EDITORIAL_HEADLINE_MAX = 140;

/**
 * Splits a post's text into a bold headline (its first line, when short enough) and the body.
 * A one-paragraph wall of text has no headline — setting it all in bold would shout.
 */
export function splitEditorialText(text: string): { headline: string; body: string } {
  const trimmed = text.trim();
  const breakAt = trimmed.indexOf('\n');
  const first = (breakAt === -1 ? trimmed : trimmed.slice(0, breakAt)).trim();
  if (!first || first.length > EDITORIAL_HEADLINE_MAX) return { headline: '', body: trimmed };
  return { headline: first, body: breakAt === -1 ? '' : trimmed.slice(breakAt + 1).trim() };
}

/** Post text clamped to `lines` lines, with a "See more" below it when it overflows and "See less" to fold back. */
export function ContentPostClampedTitle({
  title,
  lines = 2,
  variant = 'body',
  editorial = false,
}: {
  title: string;
  lines?: number;
  /** `headline`: 18/26 semibold in the News scope (posts with media). */
  variant?: 'body' | 'headline';
  /** News: the first line is set as a bold sans headline, the rest as body text under it. */
  editorial?: boolean;
}) {
  if (editorial) return <EditorialPostText text={title} lines={lines} />;
  return <ClampedText title={title} lines={lines} variant={variant} />;
}

function EditorialPostText({ text, lines }: { text: string; lines: number }) {
  const { headline, body } = splitEditorialText(text);
  return (
    <div>
      {headline ? (
        <h3 className="gn-editorial-headline">
          {headline}
        </h3>
      ) : null}
      {body ? (
        <div className={headline ? 'mt-1' : ''}>
          <ClampedText title={body} lines={headline ? Math.max(3, lines - 1) : lines} variant="body" as="p" />
        </div>
      ) : null}
    </div>
  );
}

function ClampedText({
  title,
  lines,
  variant,
  as = 'h3',
}: {
  title: string;
  lines: number;
  variant: 'body' | 'headline';
  as?: 'h3' | 'p';
}) {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const Tag = as;
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [measuredFor, setMeasuredFor] = useState({ title, lines });

  if (measuredFor.title !== title || measuredFor.lines !== lines) {
    setMeasuredFor({ title, lines });
    setExpanded(false);
  }

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight - el.clientHeight > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [title, lines, expanded]);

  const collapse = () => {
    setExpanded(false);
    const el = ref.current;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  return (
    <div>
      <Tag
        ref={ref as RefObject<HTMLHeadingElement & HTMLParagraphElement>}
        data-variant={variant}
        className="gn-post-text whitespace-pre-wrap text-[15px] font-normal leading-[1.3333] text-[#111111] dark:text-[#E4E6EB]"
        style={
          expanded
            ? undefined
            : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lines, overflow: 'hidden' }
        }
      >
        {title}
      </Tag>
      {overflows && !expanded ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          aria-expanded={false}
          className="mt-2 inline-flex items-center text-[15px] font-semibold leading-5 text-[#0F1419] underline-offset-4 transition-colors hover:underline dark:text-[#E7E9EA]"
        >
          {t('See more')}
        </button>
      ) : null}
      {overflows && expanded ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            collapse();
          }}
          aria-expanded
          className="group/less mt-2 inline-flex items-center gap-1 text-[14px] font-semibold leading-none text-[#0F1419] underline-offset-4 transition-colors hover:underline dark:text-[#E7E9EA]"
        >
          {t('See less')}
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover/less:-translate-y-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
