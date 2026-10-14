'use client';

import type { ReactNode } from 'react';
import {
  HEADER_SIZE_STEPS,
  HEADER_WEIGHT_STEPS,
  HeaderBlock,
  HeaderElementToggles,
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
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/**
 * The whole Header tab body for the eight shared header designs, described once. A section only
 * supplies its placeholder copy and its palette.
 */

const MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: msg('Small') },
  { value: 'md' as const, label: msg('Medium') },
  { value: 'lg' as const, label: msg('Large') },
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
  const t = useT();
  const record = settings as Record<string, unknown>;
  const titleSize = (record.headerTitleSize as HeaderTextSize | undefined) ?? 'md';
  const titleWeight = (record.headerTitleWeight as HeaderTextWeight | undefined) ?? 'regular';
  return (
    <div className="pf-exp-centered-config space-y-8 border-t border-neutral-200/70 pt-9">
      {hideAlignment ? null : (
        <HeaderOptionGrid
          label={t('Header alignment')}
          options={[
            { value: 'left' as const, label: t('Left') },
            { value: 'center' as const, label: t('Center') },
            { value: 'right' as const, label: t('Right') },
          ]}
          value={(record.headerDesignAlignment as 'left' | 'center' | 'right' | undefined) ?? 'left'}
          onChange={(headerDesignAlignment) => onPatch({ headerDesignAlignment })}
          columns={3}
        />
      )}
      <HeaderOptionGrid
        label={t('Bottom spacing')}
        options={MARGIN_BOTTOM_OPTIONS}
        value={(record.headerMarginBottom as 'sm' | 'md' | 'lg' | 'xl' | undefined) ?? 'md'}
        onChange={(headerMarginBottom) => onPatch({ headerMarginBottom })}
        columns={4}
      />
      {hideTitleControls ? null : (
        <>
          <HeaderSteppedSlider
            label={t('Title size')}
            steps={HEADER_SIZE_STEPS}
            value={titleSize}
            currentName={HEADER_SIZE_STEPS.find((step) => step.value === titleSize)?.name ?? ''}
            onChange={(headerTitleSize) => onPatch({ headerTitleSize })}
          />
          <HeaderSteppedSlider
            label={t('Title weight')}
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
  extra?: (design: string, shared: (opts?: SharedOptions) => ReactNode, toggles: ReactNode) => ReactNode;
}) {
  const t = useT();
  const record = settings as Record<string, unknown>;
  const design = (record.headerDesign as string | undefined) ?? 'editorial';
  const text = (key: string) => (typeof record[key] === 'string' ? (record[key] as string) : '');
  const set = (key: string) => (value: string) => onPatch({ [key]: value });
  const colorProps = { colorOptions, resolveColor };
  /** Show / hide each element of the chosen design — sits right under that design's texts. */
  const toggles = (
    <HeaderBlock>
      <HeaderElementToggles design={design} settings={settings} onPatch={onPatch} />
    </HeaderBlock>
  );
  const shared = (opts?: SharedOptions) => (
    <HeaderSharedControls settings={settings} onPatch={onPatch} {...opts} />
  );

  const customised = extra?.(design, shared, toggles);
  if (customised) return <>{customised}</>;

  if (design === 'index') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField label={t('Rule label')} value={text('headerIndexLabelText')} placeholder={copy.index.rule} onChange={set('headerIndexLabelText')} />
          <HeaderTextField label={t('Title')} value={text('headerIndexTitleText')} placeholder={copy.index.title} onChange={set('headerIndexTitleText')} />
          <HeaderTextField label={t('Subtitle')} value={text('headerIndexSubtitleText')} placeholder={copy.index.subtitle} onChange={set('headerIndexSubtitleText')} multiline />
          <HeaderTextField label={t('Count label')} value={text('headerIndexCountLabelText')} placeholder={copy.index.count} onChange={set('headerIndexCountLabelText')} />
        </div>
        {toggles}
        <HeaderBlock>
          <HeaderTextStyleEditor settings={settings} onPatch={onPatch} prefix="headerIndex" {...colorProps} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            title={t('Counter')}
            targets={[{ id: 'numeral', label: t('Numeral'), color: { key: 'headerIndexNumberColor', fallback: 'principal' } }]}
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
        {toggles}
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            targets={[
              {
                id: 'words',
                label: t('Words'),
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
          <HeaderTextField label={t('Badge text')} value={text('headerAccentCountBadgeText')} placeholder={copy.accent.badge} onChange={set('headerAccentCountBadgeText')} />
          <HeaderTextField label={t('Lead text')} value={text('headerAccentCountLeadText')} placeholder={copy.accent.lead} onChange={set('headerAccentCountLeadText')} multiline />
        </div>
        {toggles}
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            initialId="lead"
            targets={[
              { id: 'badge', label: t('Badge'), color: { key: 'headerAccentCountBadgeColor', fallback: 'principal' } },
              {
                id: 'lead',
                label: t('Lead'),
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
              label={t('Size (badge and lead)')}
              steps={HEADER_SIZE_STEPS}
              value={size}
              currentName={HEADER_SIZE_STEPS.find((step) => step.value === size)?.name ?? ''}
              onChange={(headerAccentCountSize) => onPatch({ headerAccentCountSize })}
            />
            <HeaderOptionGrid
              label={t('Alignment')}
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
          <HeaderTextField label={t('Label')} value={text('headerSerifLeadLabelText')} placeholder={copy.serif.label} onChange={set('headerSerifLeadLabelText')} />
          <HeaderTextField label={t('Title')} value={text('headerSerifLeadTitleText')} placeholder={copy.serif.title} onChange={set('headerSerifLeadTitleText')} multiline />
          <HeaderTextField label={t('Subtitle')} value={text('headerSerifLeadSubtitleText')} placeholder={copy.serif.subtitle} onChange={set('headerSerifLeadSubtitleText')} multiline />
        </div>
        {toggles}
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
          <HeaderTextField label={t('Big background word')} value={text('headerBillboardBigWord')} placeholder={copy.billboard.word} onChange={set('headerBillboardBigWord')} />
          <HeaderTextField label={t('Title')} value={text('headerBillboardTitleText')} placeholder={copy.billboard.title} onChange={set('headerBillboardTitleText')} />
          <HeaderTextField label={t('Count line')} value={text('headerBillboardCountText')} placeholder={copy.billboard.count} onChange={set('headerBillboardCountText')} />
        </div>
        {toggles}
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            initialId="title"
            targets={[
              { id: 'word', label: t('Big word'), color: { key: 'headerBillboardWordColor', fallback: 'principal' } },
              { id: 'title', label: t('Title'), color: { key: 'headerBillboardTitleColor', fallback: 'principal' } },
              { id: 'count', label: t('Count line'), color: { key: 'headerBillboardMetaColor', fallback: 'secondaire' } },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderOptionGrid
            label={t('Big word style')}
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
          <HeaderTextField label={t('Line 1')} value={text('headerMastheadLine1Text')} placeholder={copy.masthead[0]} onChange={set('headerMastheadLine1Text')} />
          <HeaderTextField label={t('Line 2')} value={text('headerMastheadLine2Text')} placeholder={copy.masthead[1]} onChange={set('headerMastheadLine2Text')} />
          <HeaderTextField label={t('Line 3')} value={text('headerMastheadLine3Text')} placeholder={copy.masthead[2]} onChange={set('headerMastheadLine3Text')} />
        </div>
        {toggles}
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            title={t('Headline style')}
            targets={[
              {
                id: 'headline',
                label: t('Headline'),
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
          <HeaderTextField label={t('Title')} value={text('headerSplitHeadingTitleText')} placeholder={copy.split.title} onChange={set('headerSplitHeadingTitleText')} />
          <HeaderTextField label={t('Label')} value={text('headerSplitHeadingLabelText')} placeholder={copy.split.label} onChange={set('headerSplitHeadingLabelText')} />
        </div>
        {toggles}
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={settings}
            onPatch={onPatch}
            initialId="title"
            targets={[
              {
                id: 'title',
                label: t('Title'),
                color: { key: 'headerSplitHeadingTitleColor', fallback: 'principal' },
                size: { key: 'headerSplitHeadingTitleSize', fallback: 'md' },
                weight: { key: 'headerSplitHeadingTitleWeight', fallback: 'regular' },
              },
              {
                id: 'label',
                label: t('Label'),
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
        <HeaderTextField label={t('Label')} value={text('headerEditorialLabelText')} placeholder={copy.editorial.label} onChange={set('headerEditorialLabelText')} />
        <HeaderTextField label={t('Title')} value={text('headerEditorialTitleText')} placeholder={copy.editorial.title} onChange={set('headerEditorialTitleText')} />
        <HeaderTextField label={t('Subtitle')} value={text('headerEditorialSubtitleText')} placeholder={copy.editorial.subtitle} onChange={set('headerEditorialSubtitleText')} multiline />
      </div>
      {toggles}
      <HeaderBlock>
        <HeaderTextStyleEditor settings={settings} onPatch={onPatch} prefix="headerEditorial" {...colorProps} />
      </HeaderBlock>
      {shared({ hideTitleControls: true })}
    </>
  );
}
