'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  DEFAULT_FAQ_PRESENTATION,
  faqHeaderFontClass,
  faqTitleColorStyle,
  faqSubtitleColorStyle,
  type PortfolioFaqPresentationSettings,
} from '@/components/portfolio/portfolio-faq-settings';
import { FAQ_HEADER_MARGIN_BOTTOM_REM } from '@/components/portfolio/portfolio-faq-header-settings';
import { FAQ_HEADER_TITLE_SIZE_CLASS, createFaqHeaderLayoutResolver } from '@/components/portfolio/portfolio-faq-header-layout';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

/** Nearest scrollable ancestor — ScrollTrigger needs this explicitly inside an
 *  embedded/iframe dashboard preview, where `window` isn't the real scroller. */
function faqHeaderScrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return undefined;
}

function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Dialogue — title words alternate bold/light weight, a spoken-exchange rhythm instead
 * of one uniform typographic voice; a small "(FAQ)" tag sits inline before the first
 * word rather than as its own kicker line. A floating question-count badge bobs gently
 * beside the title, and a hairline rule draws in beneath the subtitle.
 */
export function FaqHeaderDialogueHeader({
  title,
  subtitle,
  presentation: presentationProp,
  itemCount,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFaqPresentationSettings;
  itemCount?: number;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_FAQ_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const titleText = title.trim();
  const subtitleText = subtitle?.trim() || '';
  const words = splitWords(titleText);
  const count = itemCount ?? 0;
  const layout = createFaqHeaderLayoutResolver(presentation, 'dialogue');
  const tagText = layout.text('tag');
  const alternate = layout.isVisible('alternate');
  const showBadge = layout.isVisible('badge') && count > 0;
  const badgeLabel = layout.text('badgeLabel') ?? (count === 1 ? 'question' : 'questions');
  const showRule = layout.isVisible('rule');
  const titleSizeClass = FAQ_HEADER_TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'md'] ?? FAQ_HEADER_TITLE_SIZE_CLASS.md;

  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (prefersReducedMotion() || !animationEnabled) return;

    gsap.registerPlugin(ScrollTrigger);
    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const pick = (selector: string) =>
          [...header.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);
        const wordLines = pick('.pf-faq-header-dialogue-word-line');
        const tag = header.querySelector<HTMLElement>('.pf-faq-header-dialogue-tag');
        const subs = pick('.pf-faq-header-dialogue-sub');
        const rule = header.querySelector<HTMLElement>('.pf-faq-header-dialogue-rule');
        const badge = header.querySelector<HTMLElement>('.pf-faq-header-dialogue-badge');

        const tl = gsap.timeline({
          defaults: { overwrite: 'auto' },
          scrollTrigger: {
            trigger: header,
            scroller: faqHeaderScrollParent(header),
            start: 'top 85%',
            once: true,
          },
        });
        if (tag) tl.fromTo(tag, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0);
        if (wordLines.length) {
          tl.set(wordLines, { yPercent: 100 }, 0);
          tl.to(wordLines, { yPercent: 0, duration: 0.85, ease: 'power3.out', stagger: 0.05 }, 0.1);
        }
        if (subs.length) tl.fromTo(subs, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.4);
        if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut', transformOrigin: 'left' }, 0.5);
        if (badge) {
          tl.fromTo(badge, { opacity: 0, scale: 0.6, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(2.4)' }, 0.2);
          // Idle float loop, started once the entrance settles.
          tl.call(() => {
            gsap.to(badge, { y: -6, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          });
        }
      }, header);
    } catch (error) {
      console.error('[FaqHeaderDialogueHeader] GSAP entrance animation failed to initialize', error);
      ctx?.revert();
      gsap.set(
        header.querySelectorAll(
          '.pf-faq-header-dialogue-word-line, .pf-faq-header-dialogue-tag, .pf-faq-header-dialogue-sub, .pf-faq-header-dialogue-rule, .pf-faq-header-dialogue-badge'
        ),
        { clearProps: 'all' }
      );
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [animationEnabled, titleText, subtitleText, count, showBadge, showRule, tagText]);

  return (
    <header
      ref={headerRef}
      className="pf-faq-header-dialogue-header relative w-full text-left"
      style={{ marginBottom: `${FAQ_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      {/* The title takes the free width (flex-1, never narrower than its longest word) and the
          badge drops under it only when both genuinely can't share a row — in a narrow column
          (e.g. Kinetic Split's left rail) the badge used to hang out past the column edge. */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <h2
          className={`mb-0 max-w-3xl flex-1 ${titleSizeClass} ${faqHeaderFontClass(presentation.titleFont, 'title')} tracking-[-0.03em] lg:leading-[0.98]`}
        >
          {tagText ? (
            <span
              className="pf-faq-header-dialogue-tag mr-3 inline-block align-middle font-mono text-[0.55em] font-semibold tracking-[0.1em]"
              style={faqSubtitleColorStyle(presentation.subtitleColor)}
            >
              {tagText}
            </span>
          ) : null}
          {words.map((word, index) => {
            const softWord = alternate && index % 2 === 1;
            return (
              // Italic glyphs lean past their box, so the reveal mask would shave the last letter
              // ("asked" → "askea"): soft words get 0.12em of room inside the mask, taken back
              // from the margin so the word spacing stays 0.28em.
              <span
                key={`${word}-${index}`}
                className={`${softWord ? 'mr-[0.16em] pr-[0.12em]' : 'mr-[0.28em]'} inline-block overflow-hidden align-bottom last:mr-0`}
              >
                <span
                  className={`pf-faq-header-dialogue-word-line inline-block ${softWord ? 'italic opacity-70' : ''}`}
                  style={{
                    ...faqTitleColorStyle(presentation.titleColor),
                    fontWeight: softWord ? 300 : undefined,
                  }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </h2>

        {showBadge ? (
          <span
            className="pf-faq-header-dialogue-badge mt-1 flex shrink-0 flex-col items-center justify-center rounded-2xl border px-4 py-3 text-center"
            style={{ borderColor: 'color-mix(in srgb, currentColor 16%, transparent)' }}
            aria-hidden
          >
            <span className="text-2xl font-bold leading-none" style={faqTitleColorStyle(presentation.titleColor)}>
              {count}
            </span>
            <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em]" style={faqSubtitleColorStyle(presentation.subtitleColor)}>
              {badgeLabel}
            </span>
          </span>
        ) : null}
      </div>

      {subtitleText ? (
        <p
          className={`pf-faq-header-dialogue-sub mb-0 mt-6 max-w-xl ${faqHeaderFontClass(presentation.subtitleFont, 'subtitle')} text-sm leading-relaxed sm:text-base`}
          style={faqSubtitleColorStyle(presentation.subtitleColor)}
        >
          {subtitleText}
        </p>
      ) : null}

      {showRule ? (
        <span
          aria-hidden
          className="pf-faq-header-dialogue-rule mt-6 block h-px w-full origin-left"
          style={{ backgroundColor: 'color-mix(in srgb, currentColor 14%, transparent)' }}
        />
      ) : null}

      {trailing ? <div className="mt-4 shrink-0">{trailing}</div> : null}
    </header>
  );
}
