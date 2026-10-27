'use client';

import { InfoPreviewPortrait } from './portfolio-info-preview-portrait';
import { useT } from '@/lib/i18n/I18nProvider';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';

/** Tall portrait and editorial copy rail, with deliberately sparse detail. */
export function InfoSplitIllustration() {
  const theme = useThumbnailTheme('info');
  const t = useT();
  return <svg viewBox="0 0 640 400" className="block h-full w-full" aria-hidden="true" data-info-split-illustration="" style={{ background: theme.background, fontFamily: 'var(--font-app, ui-sans-serif), system-ui, sans-serif' }}>
    <InfoPreviewPortrait x={40} y={40} width={214} height={320} />
    <text x="296" y="107" fill={theme.ink} fontSize="39" fontWeight="600" letterSpacing="-1">{t('About me')}</text>
    <text x="296" y="151" fill={theme.muted} fontSize="18">Je transforme vos idées en</text><text x="296" y="176" fill={theme.muted} fontSize="18">produits clairs et singuliers.</text>
    <path d="M296 219H584M296 274H584" stroke={theme.border} />
    <path d="M296 242H318" stroke={theme.accent} strokeWidth="3" />
    <text x="336" y="248" fill={theme.ink} fontSize="20">Design produit</text>
    <path d="M296 297H318" stroke={theme.accent} strokeWidth="3" />
    <text x="336" y="303" fill={theme.ink} fontSize="20">Direction artistique</text>
  </svg>;
}
