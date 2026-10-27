'use client';

import { InfoPreviewPortrait } from './portfolio-info-preview-portrait';
import { useT } from '@/lib/i18n/I18nProvider';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';

/** Minimal portrait/statement silhouette; omit miniature copy that competes with the layout. */
export function InfoTraitIllustration() {
  const theme = useThumbnailTheme('info');
  const t = useT();
  return <svg viewBox="0 0 640 400" className="block h-full w-full" aria-hidden="true" data-info-trait-illustration="" style={{ background: theme.background, fontFamily: 'var(--font-app, ui-sans-serif), system-ui, sans-serif' }}>
    <InfoPreviewPortrait x={52} y={62} width={174} height={194} />
    <path d="M260 83V237" stroke={theme.accent} strokeWidth="3" />
    <text x="286" y="134" fill={theme.ink} fontSize="38" fontWeight="600" letterSpacing="-0.9">{t('About me')}</text>
    <text x="286" y="173" fill={theme.muted} fontSize="18">Designer indépendant, je conçois</text><text x="286" y="198" fill={theme.muted} fontSize="18">des expériences simples et utiles.</text>
    <path d="M52 310H208M244 310H400M436 310H588" stroke={theme.border} />
    <text x="52" y="338" fill={theme.ink} fontSize="28">8 ans</text><text x="244" y="338" fill={theme.ink} fontSize="28">120+</text><text x="436" y="338" fill={theme.ink} fontSize="28">40</text><text x="52" y="366" fill={theme.muted} fontSize="16">Expérience</text><text x="244" y="366" fill={theme.muted} fontSize="16">Projets livrés</text><text x="436" y="366" fill={theme.muted} fontSize="16">Clients</text>
  </svg>;
}
