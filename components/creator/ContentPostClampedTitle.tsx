'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/** Post text clamped to `lines` lines, with a "See more" below it when it overflows and "See less" to fold back. */
export function ContentPostClampedTitle({ title, lines = 2 }: { title: string; lines?: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
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
      <h3
        ref={ref}
        className="whitespace-pre-wrap text-[15px] font-normal leading-[1.3333] text-[#111111] dark:text-[#E4E6EB]"
        style={
          expanded
            ? undefined
            : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lines, overflow: 'hidden' }
        }
      >
        {title}
      </h3>
      {overflows && !expanded ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          aria-expanded={false}
          className="mt-2 inline-flex items-center text-[14px] font-medium leading-none text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
        >
          See more
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
          className="group/less mt-2 inline-flex items-center gap-1 text-[14px] font-medium leading-none text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
        >
          See less
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
