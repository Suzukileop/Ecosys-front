'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';

/** Simplified desktop anatomy of AboutMeClassicLayout, not a generic card grid. */
export function InfoClassicIllustration() {
  const theme = useThumbnailTheme('info');
  const t = useT();
  return <svg viewBox="0 0 640 400" className="block h-full w-full" aria-hidden="true" data-info-classic-illustration="" style={{ background: theme.background, fontFamily: 'var(--font-app, ui-sans-serif), system-ui, sans-serif' }}>
    <path d="M40 42H70" stroke={theme.accent} strokeWidth="3" />
    <text x="40" y="96" fill={theme.ink} fontSize="43" fontWeight="500" letterSpacing="-1.4">{t('About me')}</text>
    <text x="226" y="145" fill={theme.muted} fontSize="20">Je crée des expériences numériques</text><text x="226" y="172" fill={theme.muted} fontSize="20">utiles, accessibles et singulières.</text>
    <path d="M40 207H600M40 290H600" stroke={theme.border} />
    <text x="40" y="244" fill={theme.ink} fontSize="19">Expertise</text><text x="40" y="328" fill={theme.ink} fontSize="19">Approche</text>
    <text x="226" y="244" fill={theme.muted} fontSize="20">Design produit · Identité visuelle</text><text x="226" y="271" fill={theme.muted} fontSize="18">Du premier croquis au lancement.</text><text x="226" y="328" fill={theme.muted} fontSize="20">Écouter, explorer et simplifier.</text><text x="226" y="355" fill={theme.muted} fontSize="18">Le bon équilibre entre forme et usage.</text>
  </svg>;
}
