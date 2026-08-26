'use client';

import Image from 'next/image';
import { useMemo, type MouseEvent, type ReactNode } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  resolveHeroAvailabilityValue,
  resolveHeroSpecialtyValue,
  resolveHeroStatementCtaTools,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';

/**
 * Statement CTA — wide headline · availability · bio · CTAs · tools rail.
 * Optional: round profile portrait (moves CTAs under bio) + independent horizontal cover.
 */
function splitBioParagraphs(raw: string): [string, string] {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  const paragraphs = raw
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (paragraphs.length >= 2) {
    return [paragraphs[0], paragraphs.slice(1).join(' ')];
  }

  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [
    cleaned,
  ];
  if (sentences.length >= 2) {
    const mid = Math.ceil(sentences.length / 2);
    return [sentences.slice(0, mid).join(' '), sentences.slice(mid).join(' ')];
  }

  const words = cleaned.split(' ');
  if (words.length > 18) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  return [cleaned, ''];
}

export function PortfolioHeroStatementCta({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');

  const displayName = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = (() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  })();

  const centerPortrait =
    data.presentation.heroStatementCtaCenterPortrait === true &&
    data.presentation.heroStatementCtaCenterCover !== true;
  const portraitRing = centerPortrait && data.presentation.heroStatementCtaPortraitRing === true;
  const portraitScale = Math.min(
    180,
    Math.max(100, data.presentation.heroStatementCtaPortraitScale ?? 100)
  );
  const portraitScaleFactor = portraitScale / 100;
  const desktopPortraitSize = `clamp(${(10 * portraitScaleFactor).toFixed(2)}rem, ${(18 * portraitScaleFactor).toFixed(2)}vw, ${(15 * portraitScaleFactor).toFixed(2)}rem)`;
  const mobilePortraitSize = `min(${(56 * portraitScaleFactor).toFixed(2)}vw, ${(14 * portraitScaleFactor).toFixed(2)}rem)`;

  const centerCover = data.presentation.heroStatementCtaCenterCover === true;
  const coverUrl = data.presentation.heroStatementCtaCoverImageUrl?.trim() || null;

  const [bioLead, bioTrail] = useMemo(() => {
    const source =
      data.description?.trim() ||
      'I turn complex ideas into thoughtful, high-performing products through strategy, design, and development.\n\nI partner with founders and teams to ship clear interfaces, resilient systems, and work that feels inevitable.';
    return splitBioParagraphs(source);
  }, [data.description]);

  const statementTools = useMemo(
    () =>
      resolveHeroStatementCtaTools(
        data.tools,
        data.presentation.heroEditorialRailSelectedTools
      ),
    [data.tools, data.presentation.heroEditorialRailSelectedTools]
  );

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const hairline = `1px solid color-mix(in srgb, ${bordure} 65%, transparent)`;
  const toolsColor = `color-mix(in srgb, ${muted} 58%, ${fond})`;
  const bandPadBottom = 'clamp(16rem, 28vh, 24rem)';

  const ctaRow = (opts?: { compact?: boolean }): ReactNode => (
    <div className={`flex flex-nowrap items-center gap-x-8 ${opts?.compact ? 'gap-x-6' : ''}`}>
      <a
        href={primaryHref}
        onClick={onNavClick(primaryHref)}
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-sans font-semibold tracking-[-0.01em] transition hover:brightness-110 ${
          opts?.compact ? 'h-11 px-6 text-[0.9rem]' : 'h-12 px-7 text-[0.95rem]'
        }`}
        style={{ backgroundColor: ink, color: fond }}
      >
        Start a project
      </a>
      <a
        href={secondaryHref}
        onClick={onNavClick(secondaryHref)}
        className={`shrink-0 font-sans font-medium tracking-[-0.01em] underline underline-offset-[5px] transition hover:opacity-80 ${
          opts?.compact ? 'text-[0.9rem]' : 'text-[0.95rem]'
        }`}
        style={{ color: ink }}
      >
        View project
      </a>
    </div>
  );

  const bioBlock = (fontSize: string): ReactNode => (
    <div className="flex min-w-0 flex-col gap-5">
      <p
        className="m-0 font-sans font-normal tracking-[-0.01em]"
        style={{ color: muted, fontSize, lineHeight: 1.55 }}
      >
        {bioLead}
      </p>
      {bioTrail ? (
        <p
          className="m-0 font-sans font-normal tracking-[-0.01em]"
          style={{ color: muted, fontSize, lineHeight: 1.55 }}
        >
          {bioTrail}
        </p>
      ) : null}
    </div>
  );

  const portraitDisk = (size: string): ReactNode => {
    const ringWidth = '3px';
    const ringGap = '4px';
    const image = (
      <div
        className="relative h-full w-full overflow-hidden rounded-full"
        style={{ backgroundColor: `color-mix(in srgb, ${bordure} 35%, ${fond})` }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`Portrait of ${displayName}`}
            fill
            sizes="(max-width: 768px) 56vw, 22vw"
            className="object-cover object-center"
            priority
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-sans text-2xl font-semibold tracking-tight md:text-4xl"
            style={{ color: muted }}
            aria-hidden
          >
            {initials}
          </div>
        )}
      </div>
    );

    if (!portraitRing) {
      return (
        <div
          className="relative shrink-0 overflow-hidden rounded-full"
          style={{
            width: size,
            height: size,
            aspectRatio: '1 / 1',
            flex: '0 0 auto',
            backgroundColor: `color-mix(in srgb, ${bordure} 35%, ${fond})`,
          }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`Portrait of ${displayName}`}
              fill
              sizes="(max-width: 768px) 56vw, 22vw"
              className="object-cover object-center"
              priority
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center font-sans text-2xl font-semibold tracking-tight md:text-4xl"
              style={{ color: muted }}
              aria-hidden
            >
              {initials}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="relative shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          aspectRatio: '1 / 1',
          flex: '0 0 auto',
          padding: ringWidth,
          backgroundColor: principal,
          boxSizing: 'border-box',
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{ padding: ringGap, backgroundColor: fond, boxSizing: 'border-box' }}
        >
          {image}
        </div>
      </div>
    );
  };

  /** Horizontal cover — width = title column; height locked (slightly taller). */
  const horizontalCover = (
    <div
      className="relative w-full overflow-hidden"
      style={{
        width: '92%',
        height: 'clamp(13rem, 28vw, 26rem)',
        borderRadius: '0.85rem',
        backgroundColor: `color-mix(in srgb, ${bordure} 35%, ${fond})`,
        border: `1px solid color-mix(in srgb, ${bordure} 50%, transparent)`,
        flex: '0 0 auto',
      }}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 92vw, 70vw"
          className="object-cover object-center"
          priority
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-sans text-sm font-medium tracking-[-0.01em]"
          style={{ color: muted }}
          aria-hidden
        >
          Cover
        </div>
      )}
    </div>
  );

  const ctaUnderBio = centerCover || centerPortrait;

  return (
    <div
      className="relative isolate w-full overflow-x-clip font-sans"
      style={{ backgroundColor: fond, color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={{ backgroundColor: fond }}
      />

      {/* —— Desktop —— */}
      <div
        className="relative z-[1] mx-auto hidden min-h-[100dvh] w-full max-w-[100rem] md:grid"
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 'calc(8.25rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(1.5rem, 3vh, 2.25rem)',
          /* Same 2-col frame always — portrait must not reshape title or tools. */
          gridTemplateColumns: 'minmax(0, 74fr) minmax(12rem, 26fr)',
          gridTemplateRows: 'auto auto auto auto',
          columnGap: 'clamp(2rem, 4.5vw, 3.5rem)',
          rowGap: 0,
          alignContent: 'start',
        }}
      >
        <h1
          className="m-0 min-w-0 font-sans font-semibold tracking-[-0.045em]"
          style={{
            gridColumn: 1,
            gridRow: 1,
            color: ink,
            fontSize: 'clamp(2.75rem, 4.6vw, 4.65rem)',
            lineHeight: 1.06,
            maxWidth: '100%',
          }}
        >
          Hi, I&apos;m {displayName} — a {specialty}.
        </h1>

        <div
          className="flex items-center justify-end gap-2.5 self-start"
          style={{ gridColumn: 2, gridRow: 1, paddingTop: '0.45rem' }}
        >
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: principal }}
            aria-hidden
          />
          <p
            className="m-0 text-[clamp(0.85rem,1vw,1rem)] font-normal leading-none tracking-[-0.01em]"
            style={{ color: muted }}
          >
            {availability}
          </p>
        </div>

        <div
          aria-hidden
          style={{
            gridColumn: '1 / -1',
            gridRow: 2,
            height: 'clamp(5.5rem, 11vh, 8.5rem)',
          }}
        />

        {/*
          Mid: cover OR portrait on the left (absolute, fit to bio height) · bio right · CTAs under bio.
          In-flow height = bio only → tools stay put.
        */}
        <div
          className="relative min-w-0"
          style={{
            gridColumn: '1 / -1',
            gridRow: 3,
            paddingBottom: bandPadBottom,
          }}
        >
          <div
            className="relative z-[1] grid w-full items-stretch"
            style={{
              gridTemplateColumns: 'minmax(0, 74fr) minmax(12rem, 26fr)',
              columnGap: 'clamp(2rem, 4.5vw, 3.5rem)',
            }}
          >
            {ctaUnderBio ? (
              <>
                <div className="relative min-h-0">
                  <div className="absolute inset-0 flex items-start">
                    <div className="w-full">
                      {centerCover ? (
                        horizontalCover
                      ) : (
                        <div className="flex justify-center">
                          {portraitDisk(desktopPortraitSize)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative min-w-0 self-start">
                  {bioBlock('clamp(1.05rem, 1.2vw, 1.2rem)')}
                  <div className="absolute left-0 top-full mt-7">{ctaRow()}</div>
                </div>
              </>
            ) : (
              <>
                {/* Default Statement CTA: CTAs bottom-aligned with end of bio */}
                <div className="flex items-end self-end">{ctaRow()}</div>
                <div className="min-w-0 self-end">
                  {bioBlock('clamp(1.05rem, 1.2vw, 1.2rem)')}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="min-w-0" style={{ gridColumn: '1 / -1', gridRow: 4 }}>
          <div className="w-full" style={{ borderTop: hairline }} />
          {statementTools.length > 0 ? (
            <div
              className="flex w-full items-baseline justify-between"
              style={{ marginTop: 'clamp(1.5rem, 3vh, 2.25rem)' }}
              role="list"
              aria-label="Tools"
            >
              {statementTools.map((tool, index) => (
                <span
                  key={`${tool}-${index}`}
                  role="listitem"
                  className="shrink-0 font-sans text-[clamp(1.05rem,1.25vw,1.2rem)] font-medium tracking-[-0.01em]"
                  style={{ color: toolsColor }}
                >
                  {tool}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* —— Mobile —— */}
      <div className="relative z-[1] mx-auto flex w-full max-w-[100rem] flex-col px-[clamp(1.25rem,5.5vw,1.5rem)] pb-12 pt-[calc(7rem+env(safe-area-inset-top,0px))] md:hidden">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: principal }}
            aria-hidden
          />
          <p
            className="m-0 text-[0.875rem] font-normal leading-none tracking-[-0.01em]"
            style={{ color: muted }}
          >
            {availability}
          </p>
        </div>

        <h1
          className="m-0 mt-8 w-full font-sans font-semibold tracking-[-0.04em]"
          style={{
            color: ink,
            fontSize: 'clamp(2.35rem, 10.5vw, 3.35rem)',
            lineHeight: 1.05,
          }}
        >
          Hi, I&apos;m {displayName} — a {specialty}.
        </h1>

        {centerCover ? (
          <div className="mt-8 w-full">
            <div
              className="relative w-full overflow-hidden"
              style={{
                height: 'clamp(13rem, 28vw, 26rem)',
                borderRadius: '0.85rem',
                backgroundColor: `color-mix(in srgb, ${bordure} 35%, ${fond})`,
                border: `1px solid color-mix(in srgb, ${bordure} 50%, transparent)`,
              }}
            >
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt=""
                  fill
                  sizes="92vw"
                  className="object-cover object-center"
                  priority
                />
              ) : (
                <div
                  className="flex h-full min-h-[9rem] w-full items-center justify-center font-sans text-sm font-medium"
                  style={{ color: muted }}
                  aria-hidden
                >
                  Cover
                </div>
              )}
            </div>
          </div>
        ) : null}

        {centerPortrait && !centerCover ? (
          <div className="mt-8 flex justify-center">{portraitDisk(mobilePortraitSize)}</div>
        ) : null}

        <div
          className={`flex flex-col gap-4 ${ctaUnderBio ? 'mt-8' : 'mt-7'}`}
        >
          <p
            className="m-0 font-sans font-normal tracking-[-0.01em]"
            style={{ color: muted, fontSize: '1rem', lineHeight: 1.55 }}
          >
            {bioLead}
          </p>
          {bioTrail ? (
            <p
              className="m-0 font-sans font-normal tracking-[-0.01em]"
              style={{ color: muted, fontSize: '1rem', lineHeight: 1.55 }}
            >
              {bioTrail}
            </p>
          ) : null}
        </div>

        <div className="mt-8">{ctaRow({ compact: true })}</div>

        <div className="mt-10 w-full" style={{ borderTop: hairline }} />

        {statementTools.length > 0 ? (
          <div
            className="mt-6 grid w-full grid-cols-3 gap-x-4 gap-y-4"
            role="list"
            aria-label="Tools"
          >
            {statementTools.map((tool, index) => (
              <span
                key={`${tool}-${index}`}
                role="listitem"
                className="font-sans text-[1.05rem] font-medium tracking-[-0.01em]"
                style={{ color: toolsColor }}
              >
                {tool}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
