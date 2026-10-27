'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { NpCollapsibleSection, NpToggleRow } from './portfolio-nav-panel-ui';
import { resolveInfoPortraitGrayscale, type PortfolioInfoSectionSettings } from './portfolio-info-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-info-design-controls.module.css';

export function InfoBannerControls({ info, onChange }: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
}) {
  const t = useT();
  return (
    <div className={`${styles.controls} ${compactStyles.controls} ${compactStyles.groupedSections}`}>
      <NpCollapsibleSection title={t('Portrait')}>
        <NpToggleRow
          title={t('Black & white portrait')}
          checked={resolveInfoPortraitGrayscale(info)}
          onChange={(infoPortraitGrayscale) => onChange({
            infoPortraitGrayscale,
            aboutManifestoAvatarGrayscale: infoPortraitGrayscale,
          })}
        />
      </NpCollapsibleSection>
    </div>
  );
}
