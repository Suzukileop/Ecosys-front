'use client';

import dynamic from 'next/dynamic';
import { useT } from '@/lib/i18n/I18nProvider';
import { NpCollapsibleSection, NpToggleRow } from './portfolio-nav-panel-ui';
import { InfoBioStyle } from './portfolio-info-bio-style';
import { InfoBioToolbar } from './portfolio-info-bio-toolbar';
import { usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { DEFAULT_ABOUT_PLATFORM_HEADLINE, type PortfolioInfoSectionSettings } from './portfolio-info-settings';
import { mergePlatformHeadlineFormat } from './portfolio-info-platform-settings';
import { SERVICE_ICON_OPTIONS, ServiceIcon, type ServiceIconChoice } from './portfolio-services-icon-cards-icons';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-info-design-controls.module.css';

const IconPicker = dynamic(() => import('./portfolio-services-settings-panel').then(m => m.ServicesIconPicker));

export function InfoPlatformControls({ info, onChange }: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
}) {
  const t = useT();
  const source = usePortfolioDesignPreviewSource();
  const format = mergePlatformHeadlineFormat(info.aboutPlatformHeadlineFormat);
  const formatInfo = { ...info, ...format };
  const skills = source?.availableSkills ?? [];
  const options = [
    { value: 'auto' as ServiceIconChoice, label: t('Auto (from the title)'), glyph: <span aria-hidden>↻</span> },
    ...SERVICE_ICON_OPTIONS.map(o => ({ value: o.value as ServiceIconChoice, label: o.label, glyph: <ServiceIcon name={o.value} size={24} /> })),
  ];
  const patchFormat = (patch: Partial<typeof format>) => onChange({ aboutPlatformHeadlineFormat: { ...format, ...patch } });
  return <div className={`${styles.controls} ${compactStyles.controls} ${compactStyles.groupedSections}`}>
    <NpCollapsibleSection title={t('Headline text')}>
      <div className={styles.settingsGroup}>
        <label className="np-field block">
          <span className="np-field-label">{t('Main title (left)')}</span>
          <textarea rows={3} className="np-input min-h-24 resize-y leading-relaxed" value={info.aboutPlatformHeadlineCustomText ?? ''} placeholder={DEFAULT_ABOUT_PLATFORM_HEADLINE} onChange={e => onChange({ aboutPlatformHeadlineCustomText: e.target.value })} />
        </label>
        <InfoBioStyle info={formatInfo} onChange={patchFormat} defaultSize={48} />
        <InfoBioToolbar info={format} onChange={patchFormat} />
      </div>
    </NpCollapsibleSection>
    {info.showSkills !== false ? <NpCollapsibleSection title={t('Cards')}>
      <NpToggleRow title={t('Filled cards without borders')} checked={info.aboutPlatformFilledCards === true} onChange={aboutPlatformFilledCards => onChange({aboutPlatformFilledCards})} />
    </NpCollapsibleSection> : null}
    {info.showSkills !== false ? <NpCollapsibleSection title={t('Icons')}>
      {skills.length ? <IconPicker services={skills} icons={info.aboutPlatformSkillIcons ?? {}} style="outline" options={options} density="compact" onChange={(id, choice) => onChange({ aboutPlatformSkillIcons: { ...info.aboutPlatformSkillIcons, [id]: choice } })} /> : <p className="np-subtle">{t('Add skills to customize their icons.')}</p>}
    </NpCollapsibleSection> : null}
  </div>;
}
