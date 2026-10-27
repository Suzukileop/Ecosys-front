'use client';

import { InfoPreviewPortrait } from './portfolio-info-preview-portrait';
import { useT } from '@/lib/i18n/I18nProvider';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';

/** Portrait / italic editorial bio pairing and a restrained lower information rail. */
export function InfoBannerIllustration() {
  const theme = useThumbnailTheme('info');
  const t = useT();
  return <svg viewBox="0 0 640 400" className="block h-full w-full" aria-hidden="true" data-info-banner-illustration="" style={{ background: theme.background, fontFamily: 'var(--font-app, ui-sans-serif), system-ui, sans-serif' }}>
    <InfoPreviewPortrait x={52} y={44} width={162} height={216} />
    <path d="M260 87V216" stroke={theme.border} />
    <text x="284" y="133" fill={theme.ink} fontFamily="'Playfair Display', Georgia, serif" fontStyle="italic" fontSize="43" fontWeight="400" letterSpacing="-0.8">{t('About me')}</text>
    <text x="284" y="175" fill={theme.muted} fontSize="18">Un regard créatif, une approche</text><text x="284" y="200" fill={theme.muted} fontSize="18">humaine et le souci du détail.</text>
    <path d="M52 306H588" stroke={theme.border} />
    <text x="52" y="338" fill={theme.ink} fontSize="27">8 ans</text><text x="244" y="338" fill={theme.ink} fontSize="27">120+</text><text x="436" y="338" fill={theme.ink} fontSize="27">Paris</text>
    <text x="52" y="368" fill={theme.muted} fontSize="16">Expérience</text><text x="244" y="368" fill={theme.muted} fontSize="16">Projets livrés</text><text x="436" y="368" fill={theme.muted} fontSize="16">France</text>
  </svg>;
}
