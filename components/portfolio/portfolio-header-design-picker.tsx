'use client';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import {StackPreviewSkeleton} from './portfolio-stack-preview-skeleton';
import {StackHeaderSkeleton} from './portfolio-stack-header-skeleton';
import {useThumbnailTheme} from './portfolio-thumbnail-theme';

import type { ReactNode } from 'react';
import { PortfolioDesignLivePreview, usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import { NpBackRow, NpOptionCard, NpOptionCardGroup, NpPickerRow } from '@/components/portfolio/portfolio-nav-panel-ui';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/**
 * Header design picker shared by every section that offers the eight shared header designs:
 * a collapsed row (thumbnail + name) that opens a catalogue of wireframe cards. The panel owns
 * `open`, so it can hide the settings below while the catalogue is showing.
 */

export type SharedHeaderDesign =
  | 'editorial'
  | 'marquee'
  | 'index'
  | 'accent-count'
  | 'serif-lead'
  | 'billboard'
  | 'masthead'
  | 'split-heading';

export const SHARED_HEADER_DESIGN_OPTIONS: { value: SharedHeaderDesign; label: string }[] = [
  { value: 'editorial', label: msg('Editorial') },
  { value: 'marquee', label: msg('Marquee') },
  { value: 'index', label: msg('Index') },
  { value: 'accent-count', label: msg('Accent count') },
  { value: 'serif-lead', label: msg('Serif lead') },
  { value: 'billboard', label: msg('Billboard') },
  { value: 'masthead', label: msg('Masthead') },
  { value: 'split-heading', label: msg('Split heading') },
];

function MiniStage({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

/** One wireframe per shared header design. `word` is the big decorative word (e.g. "CONTACT"). */
export function HeaderDesignWireframe({ design, word }: { design: SharedHeaderDesign | 'none'; word: string }) {
  switch (design) {
    case 'none':
      return (
        <MiniStage>
          <rect className="pf-stack-mini-mute" x="30" y="34" width="60" height="3" rx="1.5" opacity={0.5} />
        </MiniStage>
      );
    case 'editorial':
      return (
        <MiniStage>
          <rect className="pf-stack-mini-accent" x="8" y="14" width="18" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="24" width="86" height="12" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="44" width="50" height="3" rx="1.5" />
        </MiniStage>
      );
    case 'marquee':
      return (
        <MiniStage>
          <text x="60" y="42" fontSize={22} fontWeight={800} textAnchor="middle" opacity={0.14} className="pf-stack-mini-ink">
            {word}
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="84" height="11" rx="2" />
        </MiniStage>
      );
    case 'index':
      return (
        <MiniStage>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="104" height="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="22" height="18" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="40" y="26" width="1.5" height="18" />
          <rect className="pf-stack-mini-ink" x="50" y="28" width="60" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="50" y="40" width="36" height="2.5" rx="1.25" />
        </MiniStage>
      );
    case 'accent-count':
      return (
        <MiniStage>
          <rect className="pf-stack-mini-accent" x="8" y="14" width="30" height="9" rx="4.5" />
          <rect className="pf-stack-mini-mute" x="8" y="30" width="46" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="39" width="70" height="9" rx="2" />
        </MiniStage>
      );
    case 'serif-lead':
      return (
        <MiniStage>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="24" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="100" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="70" height="10" rx="2" opacity={0.5} />
        </MiniStage>
      );
    case 'billboard':
      return (
        <MiniStage>
          <text x="60" y="38" fontSize={25} fontWeight={900} textAnchor="middle" opacity={0.1} className="pf-stack-mini-ink">
            {word}
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="60" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="18" y="44" width="40" height="3" rx="1.5" />
        </MiniStage>
      );
    case 'masthead':
      return (
        <MiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="12" width="90" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="70" height="10" rx="2" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="80" height="10" rx="2" opacity={0.3} />
        </MiniStage>
      );
    case 'split-heading':
      return (
        <MiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="26" width="58" height="11" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="41" width="36" height="11" rx="2" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="86" y="16" width="26" height="3" rx="1.5" />
        </MiniStage>
      );
  }
}

export function HeaderDesignPicker<V extends SharedHeaderDesign | 'none' = SharedHeaderDesign>({
  value,
  onChange,
  open,
  onOpenChange,
  word,
  allowNone = false,
  catalogueMode = false,
  previewSection,
}: {
  value: V;
  onChange: (value: V) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: string;
  /** Adds a "None" choice first: no header above the section. */
  allowNone?: boolean;
  catalogueMode?: boolean;
  previewSection?: 'experienceHeader';
}) {
  const t = useT();
  const previewSource = usePortfolioDesignPreviewSource();
  const thumbnailTheme = useThumbnailTheme('experience');
  const options: { value: SharedHeaderDesign | 'none'; label: string }[] = allowNone
    ? [{ value: 'none', label: msg('None') }, ...SHARED_HEADER_DESIGN_OPTIONS]
    : SHARED_HEADER_DESIGN_OPTIONS;
  const selected = options.find((option) => option.value === value) ?? options[0]!;
  if(catalogueMode){
    if(!open)return <NpBackRow title={t(selected.label)} onBack={()=>onOpenChange(true)}/>;
    return (
      <div className={`flex flex-col ${previewSection ? 'gap-8' : 'gap-7'}`} aria-label={t('Choose a header')}>
        {options.map((option) => {
          if (previewSection && option.value === 'none') {
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={value === option.value}
                onClick={() => onChange(option.value as V)}
                className="flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ borderColor: value === option.value ? 'var(--pf-palette-principal,#f97316)' : 'color-mix(in srgb,currentColor 18%,transparent)' }}
              >
                {t(option.label)}
              </button>
            );
          }
          const wireframe = previewSection
            ? <StackPreviewSkeleton section="experience"><StackHeaderSkeleton design={option.value} word="EXPERIENCE" title="Mon parcours" lead="Mon" count="04" compact/></StackPreviewSkeleton>
            : <HeaderDesignWireframe design={option.value} word={word} />;
          return (
            <PortfolioHeaderDesignOption key={option.value} design={option.value}>
              <DesignCatalogueCard
                label={t(option.label)}
                selected={value === option.value}
                previewBackground={previewSection ? thumbnailTheme.background : undefined}
                onSelect={() => onChange(option.value as V)}
                onCustomize={() => {
                  if (value !== option.value) onChange(option.value as V);
                  onOpenChange(false);
                }}
              >
                {previewSection && previewSource && option.value !== 'none' ? (
                  <span className="relative block aspect-[3/1] w-full" style={{backgroundColor:thumbnailTheme.background}}>
                    <PortfolioDesignLivePreview
                      src={withDesignPreview(previewSource.portfolioPath, { section: previewSection, design: option.value })+'&previewRevision=experience-header-compact-v3'}
                      settings={previewSource.settings}
                      fill
                      loadMargin="48px 0px"
                      skeleton={wireframe}
                      animateSkeleton={false}
                      backgroundColor={thumbnailTheme.background}
                    />
                  </span>
                ) : previewSection ? <span className="relative block aspect-[3/1] w-full">{wireframe}</span> : wireframe}
              </DesignCatalogueCard>
            </PortfolioHeaderDesignOption>
          );
        })}
      </div>
    );
  }

  if (open) {
    return (
      <div className="np-stack">
        <NpBackRow title={t('Header design')} onBack={() => onOpenChange(false)} />
        <NpOptionCardGroup label={t('Choose a header')} columns={2}>
          {options.map((option) => (
            <PortfolioHeaderDesignOption key={option.value} design={option.value}>
              <NpOptionCard
                selected={option.value === value}
                title={t(option.label)}
                illustration={<HeaderDesignWireframe design={option.value} word={word} />}
                onClick={() => {
                  onChange(option.value as V);
                  onOpenChange(false);
                }}
              />
            </PortfolioHeaderDesignOption>
          ))}
        </NpOptionCardGroup>
      </div>
    );
  }

  return (
    <NpPickerRow
      label={t('Header design')}
      value={t(selected.label)}
      thumbnail={<HeaderDesignWireframe design={value} word={word} />}
      onClick={() => onOpenChange(true)}
    />
  );
}
