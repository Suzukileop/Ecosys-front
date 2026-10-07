'use client';

import type { ReactNode } from 'react';
import {
  HEADER_SIZE_STEPS,
  HEADER_WEIGHT_STEPS,
  HeaderBlock,
  HeaderMarqueeWords,
  HeaderOptionGrid,
  HeaderStyleTargetsEditor,
  HeaderSteppedSlider,
  HeaderTextField,
  HeaderTextStyleEditor,
  type HeaderPaletteToken,
  type HeaderPatch,
  type HeaderTextSize,
  type HeaderTextWeight,
} from '@/components/portfolio/portfolio-header-style-controls';

/**
 * The whole Header tab body for the eight shared header designs, described once. A section only
 * supplies its placeholder copy and its palette.
 */

const MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
  { value: 'xl' as const, label: 'XL' },
];

type SharedOptions = { hideAlignment?: boolean; hideTitleControls?: boolean };

/** Controls every design shares: alignment, bottom spacing and (title size / weight). */
export function HeaderSharedControls({
  settings,
  onPatch,
  hideAlignment = false,
  hideTitleControls = false,
}: SharedOptions & {
  settings: object;
  onPatch: (patch: HeaderPatch) => void;
}) {
  const record = settings as Record<string, unknown>;
  const titleSize = (record.headerTitleSize as HeaderTextSize | undefined) ?? 'md';
  const titleWeight = (record.headerTitleWeight as HeaderTextWeight | undefined) ?? 'regular';
  return (
    <div className="pf-exp-centered-config space-y-8 border-t border-neutral-200/70 pt-9">
      {hideAlignment ? null : (
        <HeaderOptionGrid
          label="Header alignment"
          options={[
            { value: 'left' as const, label: 'Left' },
            { value: 'center' as const, label: 'Center' },
            { value: 'right' as const, label: 'Right' },
          ]}
          value={(record.headerDesignAlignment as 'left' | 'center' | 'right' | undefined) ?? 'left'}
          onChange={(headerDesignAlignment) => onPatch({ headerDesignAlignment })}
          columns={3}
        />
      )}
      <HeaderOptionGrid
        label="Bottom spacing"
        options={MARGIN_BOTTOM_OPTIONS}
        value={(record.headerMarginBottom as 'sm' | 'md' | 'lg' | 'xl' | undefined) ?? 'md'}
        onChange={(headerMarginBottom) => onPatch({ headerMarginBottom })}
        columns={4}
      />
      {hideTitleControls ? null : (
        <>
          <HeaderSteppedSlider
            label="Title size"
            steps={HEADER_SIZE_STEPS}
            value={titleSize}
            currentName={HEADER_SIZE_STEPS.find((step) => step.value === titleSize)?.name ?? ''}
            onChange={(headerTitleSize) => onPatch({ headerTitleSize })}
          />
          <HeaderSteppedSlider
            label="Title weight"
            steps={HEADER_WEIGHT_STEPS}
            value={titleWeight}
            currentName={HEADER_WEIGHT_STEPS.find((step) => step.value === titleWeight)?.tick ?? ''}
            onChange={(headerTitleWeight) => onPatch({ headerTitleWeight })}
            stepStyle={(step) => ({ fontWeight: HEADER_WEIGHT_STEPS.find((item) => item.value === step.value)?.css })}
          />
        </>
      )}
    </div>
  );
}

/** The words each design shows as placeholders — the only thing that differs from one section to the next. */
export type HeaderCopy = {
  editorial: { label: string; title: string; subtitle: string };
  index: { rule: string; title: string; subtitle: string; count: string };
  marquee: readonly [string, string, string, string];
  accent: { badge: string; lead: string };
  serif: { label: string; title: string; subtitle: string };
  billboard: { word: string; title: string; count: string };
  masthead: readonly [string, string, string];
  split: { title: string; label: string };
};

type OptionList<T extends string> = readonly { value: T; label: string }[];

export function HeaderDesignFields({
  settings,
  onPatch,
  copy,
  colorOptions,
  resolveColor,
  accentAlignmentOptions,
  billboardStyleOptions,
  extra,
}: {
  settings: object;
  onPatch: (patch: HeaderPatch) => void;
  copy: HeaderCopy;
  colorOptions: readonly { value: HeaderPaletteToken; label: string }[];
  resolveColor: (token: HeaderPaletteToken) => string;
  accentAlignmentOptions: OptionList<'left' | 'center' | 'right'>;
  billboardStyleOptions: OptionList<'outline' | 'fill' | 'simple'>;
  /** Designs a section has beyond the shared eight (Info: chapter / cover). Return null for the shared ones. */
  extra?: (design: string, shared: (opts?: SharedOptions) => ReactNode) => ReactNode;
}) {
  const record = settings as Record<string, unknown>;
  const design = (record.headerDesign as string | undefined) ?? 'editorial';
  const text = (key: string) => (typeof record[key] === 'string' ? (record[key] as string) : '');
  const set = (key: string) => (value: string) => onPatch({ [key]: value });
  const colorProps = { colorOptions, resolveColor };
  const shared = (opts?: SharedOptions) => (
    <HeaderSharedControls settings={settings} onPatch={onPatch} {...opts} />
  );

  const customised = extra?.(design, shared);
  if (customised) return <>{customised}</>;

  if (design === 'index') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField label="Rule label" value={text('headerIndexLabelText')} placeholder={copy.index.rule} onChange={set('headerIndexLabelText')} />
          <HeaderTextField label="Title" value={text('headerIndexTitleText')} placeholder={copy.index.title} onChange={set('headerIndexTitleText')} />
          <HeaderTextField label="Subtitle" value={text('headerIndexSubtitleText')} placeholder={copy.index.subtitle} onChange={set('headerIndexSubtitleText')} multiline />
          <HeaderTextField label="Count label" value={text('headerIndexCountLabelText')} placeholder={copy.index.count} onChange={set('headerIndexCountLabelText')} />
        </div>
        <HeaderBlock>
          <HeaderTextStyleEditor settings={settings} onPatch={onPatch} prefix="headerIndex" {...colorProps} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            title="Counter"
            targets={[{ id: 'numeral', label: 'Numeral', color: { key: 'headerIndexNumberColor', fallback: 'principal' } }]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideTitleControls: true })}
      </>
    );
  }

  if (design === 'marquee') {
    return (
      <>
        <HeaderMarqueeWords
          settings={settings}
          onPatch={onPatch}
          keys={['headerMarqueeWord1Text', 'headerMarqueeWord2Text', 'headerMarqueeWord3Text', 'headerMarqueeWord4Text']}
          placeholders={copy.marquee}
        />
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            targets={[
              {
                id: 'words',
                label: 'Words',
                color: { key: 'headerMarqueeWordColor', fallback: 'principal' },
                size: { key: 'headerMarqueeSize', fallback: 'md' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }

  if (design === 'accent-count') {
    const size = (record.headerAccentCountSize as HeaderTextSize | undefined) ?? 'md';
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField label="Badge text" value={text('headerAccentCountBadgeText')} placeholder={copy.accent.badge} onChange={set('headerAccentCountBadgeText')} />
          <HeaderTextField label="Lead text" value={text('headerAccentCountLeadText')} placeholder={copy.accent.lead} onChange={set('headerAccentCountLeadText')} multiline />
        </div>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            initialId="lead"
            targets={[
              { id: 'badge', label: 'Badge', color: { key: 'headerAccentCountBadgeColor', fallback: 'principal' } },
              {
                id: 'lead',
                label: 'Lead',
                color: { key: 'headerAccentCountLeadColor', fallback: 'secondaire' },
                weight: { key: 'headerAccentCountWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        <HeaderBlock>
          <div className="pf-exp-centered-config space-y-8">
            <HeaderSteppedSlider
              label="Size (badge and lead)"
              steps={HEADER_SIZE_STEPS}
              value={size}
              currentName={HEADER_SIZE_STEPS.find((step) => step.value === size)?.name ?? ''}
              onChange={(headerAccentCountSize) => onPatch({ headerAccentCountSize })}
            />
            <HeaderOptionGrid
              label="Alignment"
              options={accentAlignmentOptions}
              value={(record.headerAccentCountAlignment as 'left' | 'center' | 'right' | undefined) ?? 'left'}
              onChange={(headerAccentCountAlignment) => onPatch({ headerAccentCountAlignment })}
              columns={3}
            />
          </div>
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }

  if (design === 'serif-lead') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField label="Label" value={text('headerSerifLeadLabelText')} placeholder={copy.serif.label} onChange={set('headerSerifLeadLabelText')} />
          <HeaderTextField label="Title" value={text('headerSerifLeadTitleText')} placeholder={copy.serif.title} onChange={set('headerSerifLeadTitleText')} multiline />
          <HeaderTextField label="Subtitle" value={text('headerSerifLeadSubtitleText')} placeholder={copy.serif.subtitle} onChange={set('headerSerifLeadSubtitleText')} multiline />
        </div>
        <HeaderBlock>
          <HeaderTextStyleEditor settings={settings} onPatch={onPatch} prefix="headerSerifLead" {...colorProps} />
        </HeaderBlock>
        {shared({ hideTitleControls: true })}
      </>
    );
  }

  if (design === 'billboard') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField label="Big background word" value={text('headerBillboardBigWord')} placeholder={copy.billboard.word} onChange={set('headerBillboardBigWord')} />
          <HeaderTextField label="Title" value={text('headerBillboardTitleText')} placeholder={copy.billboard.title} onChange={set('headerBillboardTitleText')} />
          <HeaderTextField label="Count line" value={text('headerBillboardCountText')} placeholder={copy.billboard.count} onChange={set('headerBillboardCountText')} />
        </div>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            initialId="title"
            targets={[
              { id: 'word', label: 'Big word', color: { key: 'headerBillboardWordColor', fallback: 'principal' } },
              { id: 'title', label: 'Title', color: { key: 'headerBillboardTitleColor', fallback: 'principal' } },
              { id: 'count', label: 'Count line', color: { key: 'headerBillboardMetaColor', fallback: 'secondaire' } },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderOptionGrid
            label="Big word style"
            options={billboardStyleOptions}
            value={(record.headerBillboardWordStyle as 'outline' | 'fill' | 'simple' | undefined) ?? 'outline'}
            onChange={(headerBillboardWordStyle) => onPatch({ headerBillboardWordStyle })}
            columns={3}
          />
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }

  if (design === 'masthead') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField label="Line 1" value={text('headerMastheadLine1Text')} placeholder={copy.masthead[0]} onChange={set('headerMastheadLine1Text')} />
          <HeaderTextField label="Line 2" value={text('headerMastheadLine2Text')} placeholder={copy.masthead[1]} onChange={set('headerMastheadLine2Text')} />
          <HeaderTextField label="Line 3" value={text('headerMastheadLine3Text')} placeholder={copy.masthead[2]} onChange={set('headerMastheadLine3Text')} />
        </div>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            title="Headline style"
            targets={[
              {
                id: 'headline',
                label: 'Headline',
                color: { key: 'headerMastheadHeadlineColor', fallback: 'principal' },
                size: { key: 'headerMastheadHeadlineSize', fallback: 'md' },
                weight: { key: 'headerMastheadHeadlineWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideTitleControls: true })}
      </>
    );
  }

  if (design === 'split-heading') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField label="Title" value={text('headerSplitHeadingTitleText')} placeholder={copy.split.title} onChange={set('headerSplitHeadingTitleText')} />
          <HeaderTextField label="Label" value={text('headerSplitHeadingLabelText')} placeholder={copy.split.label} onChange={set('headerSplitHeadingLabelText')} />
        </div>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            initialId="title"
            targets={[
              {
                id: 'title',
                label: 'Title',
                color: { key: 'headerSplitHeadingTitleColor', fallback: 'principal' },
                size: { key: 'headerSplitHeadingTitleSize', fallback: 'md' },
                weight: { key: 'headerSplitHeadingTitleWeight', fallback: 'regular' },
              },
              {
                id: 'label',
                label: 'Label',
                color: { key: 'headerSplitHeadingLabelColor', fallback: 'secondaire' },
                size: { key: 'headerSplitHeadingLabelSize', fallback: 'md' },
                weight: { key: 'headerSplitHeadingLabelWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }

  // Editorial — kicker + title + subtitle. An empty text falls back to the kicker / section title / section subtitle.
  return (
    <>
      <div className="space-y-6">
        <HeaderTextField label="Label" value={text('headerEditorialLabelText')} placeholder={copy.editorial.label} onChange={set('headerEditorialLabelText')} />
        <HeaderTextField label="Title" value={text('headerEditorialTitleText')} placeholder={copy.editorial.title} onChange={set('headerEditorialTitleText')} />
        <HeaderTextField label="Subtitle" value={text('headerEditorialSubtitleText')} placeholder={copy.editorial.subtitle} onChange={set('headerEditorialSubtitleText')} multiline />
      </div>
      <HeaderBlock>
        <HeaderTextStyleEditor settings={settings} onPatch={onPatch} prefix="headerEditorial" {...colorProps} />
      </HeaderBlock>
      {shared({ hideTitleControls: true })}
    </>
  );
}
