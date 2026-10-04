'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';

const SEPARATOR = /(\s*\/\s*|\s+)/;

function abbreviateWord(word: string): string {
  const chars = Array.from(word);
  return chars.length <= 2 ? word : `${chars[0]}.`;
}

/** Full text first, then one more word shortened to "X." per step, starting from the last word. */
export function abbreviationSteps(text: string): string[] {
  const parts = text.split(SEPARATOR);
  const wordIndexes = parts
    .map((part, index) => (index % 2 === 0 && Array.from(part).length > 2 ? index : -1))
    .filter((index) => index >= 0);
  const steps = [text];
  const next = [...parts];
  for (let i = wordIndexes.length - 1; i >= 0; i--) {
    next[wordIndexes[i]] = abbreviateWord(parts[wordIndexes[i]]);
    steps.push(next.join(''));
  }
  return steps;
}

let measureContext: CanvasRenderingContext2D | null = null;

function textWidth(text: string, style: CSSStyleDeclaration): number {
  measureContext ??= document.createElement('canvas').getContext('2d');
  if (!measureContext) return 0;
  measureContext.font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  if ('letterSpacing' in measureContext) {
    (measureContext as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
  }
  return measureContext.measureText(text).width;
}

type AbbreviatedLineProps = {
  text: string;
  as?: 'h3' | 'p' | 'span';
  href?: string | null;
  className?: string;
  textClassName?: string;
  /** Inline marks kept right after the text (flag, badge…); they never shrink. */
  after?: ReactNode;
};

/**
 * Single line that never shows an ellipsis: when the text does not fit, words are shortened to
 * their initial ("Designer" → "D.") from the end until it does.
 */
export function AbbreviatedLine({
  text,
  as: Tag = 'span',
  href,
  className = '',
  textClassName = '',
  after,
}: AbbreviatedLineProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const afterRef = useRef<HTMLSpanElement>(null);
  const [fitted, setFitted] = useState({ text, value: text });
  const hasAfter = Boolean(after);

  useEffect(() => {
    const box = boxRef.current;
    const textEl = textRef.current;
    if (!box || !textEl) return;
    const steps = abbreviationSteps(text);

    const fit = () => {
      const style = getComputedStyle(textEl);
      const gap = hasAfter ? parseFloat(getComputedStyle(box).columnGap) || 0 : 0;
      const available = box.clientWidth - (afterRef.current?.offsetWidth ?? 0) - gap;
      const value = steps.find((step) => textWidth(step, style) <= available + 0.5) ?? steps[steps.length - 1];
      setFitted((prev) => (prev.text === text && prev.value === value ? prev : { text, value }));
    };

    const observer = new ResizeObserver(fit);
    observer.observe(box);
    if (afterRef.current) observer.observe(afterRef.current);
    let active = true;
    void document.fonts?.ready.then(() => {
      if (active) fit();
    });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [text, hasAfter]);

  const display = fitted.text === text ? fitted.value : text;
  const content = (
    <Tag
      ref={textRef as never}
      title={display === text ? undefined : text}
      className={`block min-w-0 overflow-hidden whitespace-nowrap ${textClassName}`}
    >
      {display}
    </Tag>
  );

  return (
    <div ref={boxRef} className={`flex min-w-0 items-center gap-2 ${className}`}>
      {href ? (
        <Link href={href} className="min-w-0 focus-visible:outline-none">
          {content}
        </Link>
      ) : (
        content
      )}
      {after ? (
        <span ref={afterRef} className="flex shrink-0 items-center gap-2">
          {after}
        </span>
      ) : null}
    </div>
  );
}
