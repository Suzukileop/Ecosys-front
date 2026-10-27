'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';

/** Editorial serif headline, short bio and understated stair-step capability cards. */
export function InfoPlatformIllustration() {
  const theme = useThumbnailTheme('info');
  const t = useT();
  return <svg viewBox="0 0 640 400" className="block h-full w-full" aria-hidden="true" data-info-platform-illustration="" style={{ background: theme.background }}>
    <path d="M44 48H74" stroke={theme.accent} strokeWidth="3" />
    <text x="44" y="118" fill={theme.ink} fontFamily="'Playfair Display', Georgia, serif" fontSize="40" fontWeight="400" letterSpacing="-1.2">{t('About me')}</text>
    <text x="366" y="88" fill={theme.muted} fontSize="18">Des idées ambitieuses,</text><text x="366" y="113" fill={theme.muted} fontSize="18">des expériences simples,</text><text x="366" y="138" fill={theme.muted} fontSize="18">un impact durable.</text>
    {[44, 184, 324, 464].map((x, i) => <g key={x}>
      <rect x={x} y={212 + i * 12} width="120" height="108" fill={`color-mix(in srgb, ${theme.ink} 5%, ${theme.background})`} />
      <path d={`M${x + 14} ${238 + i * 12}h18`} stroke={theme.accent} strokeWidth="2" />
      <text x={x + 14} y={278 + i * 12} fill={theme.ink} fontSize="16" fontWeight="600">{['Stratégie', 'Design UX', 'Identité', 'Web'][i]}</text>
      <text x={x + 14} y={300 + i * 12} fill={theme.muted} fontSize="14">{['Clarifier', 'Simplifier', 'Distinguer', 'Construire'][i]}</text>
    </g>)}
  </svg>;
}
