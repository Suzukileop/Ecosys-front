'use client';

import type { PortfolioExperienceDesign } from './portfolio-experience-settings';
import { useT } from '@/lib/i18n/I18nProvider';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';

/** A readable layout illustration, rather than a desktop page reduced to miniature text. */
export function ExperienceDesignIllustration({ design }: { design: PortfolioExperienceDesign }) {
  const t = useT();
  const theme = useThumbnailTheme('experience');
  const { ink, muted, accent } = theme;
  const surface = theme.card;
  const edge = theme.border;
  const title = (x: number, y: number, text: string, size = 32) => <text x={x} y={y} fill={ink} fontSize={size} fontWeight="650" letterSpacing="-1">{text}</text>;
  const label = (x: number, y: number, text: string, size = 24) => <text x={x} y={y} fill={muted} fontSize={size}>{text}</text>;
  const bar = (x: number, y: number, width: number) => <rect x={x} y={y} width={width} height="7" rx="3.5" fill={ink} opacity="0.12" />;
  const card = (x: number, y: number, width: number, height: number) => <rect x={x} y={y} width={width} height={height} rx="14" fill={surface} stroke={edge} />;
  const chips = (x: number, y: number) => <><rect x={x} y={y} width="48" height="14" rx="7" fill={accent} opacity="0.7" /><rect x={x + 58} y={y} width="62" height="14" rx="7" fill={ink} opacity="0.12" /></>;
  const media = (x: number, y: number, width: number, height: number, alternate = false) => (
    <svg x={x} y={y} width={width} height={height} viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" overflow="hidden">
      <rect width="320" height="200" fill={surface} />
      <rect width="320" height="200" fill={accent} opacity={alternate ? '0.06' : '0.12'} />
      <rect x={alternate ? 0 : 176} width={alternate ? 126 : 144} height="200" fill={ink} opacity="0.07" />
      <rect y={alternate ? 124 : 148} width="320" height={alternate ? 76 : 52} fill={ink} opacity="0.05" />
    </svg>
  );
  let composition;
  switch (design) {
    case 'kinetic':
      composition = <>
        {label(44, 78, '2024 — 2026')}
        {title(40, 179, 'Designer', 80)}
        {label(44, 234, 'Studio')}
        {bar(44, 264, 218)}
        {bar(44, 283, 164)}
        {chips(468, 300)}
      </>;
      break;
    case 'editorial':
      composition = <>
        <path d="M165 64V336" stroke={edge} />
        {label(40, 100, '2024')}{title(202, 101, 'Designer', 36)}
        {label(202, 140, 'Studio')}{bar(202, 167, 334)}{bar(202, 186, 256)}
        <path d="M40 229H600" stroke={edge} />
        {label(40, 282, '2022')}{title(202, 283, t('Freelance'), 34)}
        {bar(202, 311, 278)}{bar(202, 330, 196)}
      </>;
      break;
    case 'milestone':
      composition = <>
        <path d="M163 68V334" stroke={edge} strokeWidth="3" />
        {[68, 222].map((y, i) => <g key={y}>
          {title(37, y + 34, i ? '2022' : '2024', 34)}
          <circle cx="163" cy={y + 22} r="7" fill={accent} />
          {card(194, y, 404, 114)}
          {title(218, y + 44, i ? t('Freelance') : 'Designer', 32)}
          {bar(218, y + 66, i ? 228 : 286)}{bar(218, y + 85, 180)}
        </g>)}
      </>;
      break;
    case 'table':
      composition = <>
        {label(40, 84, t('Period'))}{label(204, 84, t('Role'))}{label(444, 84, 'Studio')}
        <path d="M40 108H600M40 203H600M40 298H600" stroke={edge} />
        {label(40, 164, '2024')}{title(204, 164, 'Designer', 30)}{bar(444, 150, 136)}
        {label(40, 259, '2022')}{title(204, 259, t('Freelance'), 30)}{bar(444, 245, 106)}
        {bar(40, 331, 90)}{bar(204, 331, 154)}{bar(444, 331, 122)}
      </>;
      break;
    case 'cards':
      composition = <>{[40, 332].map((x, i) => <g key={x}>
        {card(x, 62, 268, 276)}
        {label(x + 24, 108, i ? '2022' : '2024')}
        {title(x + 24, 166, i ? t('Freelance') : 'Designer', 32)}
        {label(x + 24, 207, 'Studio')}
        {bar(x + 24, 239, 204)}{bar(x + 24, 258, 156)}
        {chips(x + 24, 295)}
      </g>)}</>;
      break;
    case 'reel':
      composition = <>
        {label(520, 62, '01 / 03', 23)}
        <text x="42" y="158" fill={ink} fontFamily="Georgia, serif" fontSize="70" letterSpacing="-3">Designer</text>
        <text x="42" y="230" fill={ink} fontFamily="Georgia, serif" fontSize="70" letterSpacing="-3">Studio</text>
        {label(44, 291, '2024 — 2026')}
        {bar(360, 258, 222)}{bar(360, 278, 178)}{bar(360, 298, 202)}
        <circle cx="286" cy="359" r="4" fill={accent} /><circle cx="306" cy="359" r="4" fill={edge} /><circle cx="326" cy="359" r="4" fill={edge} />
      </>;
      break;
    case 'duotone':
      composition = <>
        <rect x="320" width="320" height="400" fill={surface} />
        {label(40, 99, '2024 — 2026', 22)}{title(40, 164, 'Designer', 43)}
        {label(40, 211, 'Studio')}{chips(40, 283)}
        {card(350, 67, 258, 266)}
        {title(374, 117, '01', 32)}{bar(374, 151, 198)}{bar(374, 172, 164)}
        {bar(374, 218, 186)}{bar(374, 239, 148)}{bar(374, 260, 175)}
      </>;
      break;
    case 'gallery':
      composition = <>{[40, 332].map((x, i) => <g key={x}>
        {card(x, 58, 268, 284)}
        {media(x + 10, 68, 248, 158, Boolean(i))}
        {title(x + 20, 270, i ? t('Freelance') : 'Designer', 30)}
        {label(x + 20, 307, i ? '2022' : '2024', 24)}
      </g>)}</>;
      break;
    case 'loft':
      composition = <>
        {media(40, 62, 194, 118)}{title(268, 110, 'Designer', 34)}{label(268, 150, 'Studio · 2024', 24)}
        <path d="M40 206H600" stroke={edge} />
        {media(40, 234, 194, 110, true)}{title(268, 277, t('Freelance'), 34)}{label(268, 317, '2022', 24)}
      </>;
      break;
    case 'press':
      composition = <>
        {label(40, 53, '2024 — 2026', 23)}
        {media(40, 82, 134, 116)}{label(204, 109, 'Studio', 23)}{title(204, 150, 'Designer', 40)}{bar(204, 178, 298)}
        <path d="M40 221H600" stroke={edge} />
        {media(40, 248, 134, 102, true)}{title(204, 284, t('Freelance'), 34)}{bar(204, 313, 268)}{bar(204, 332, 194)}
      </>;
      break;
    case 'legacy':
      composition = <>
        {media(40, 62, 298, 210)}
        {title(40, 319, 'Designer', 38)}{label(40, 354, '2024 — 2026', 23)}
        {title(380, 127, 'Studio', 34)}{bar(380, 164, 208)}{bar(380, 184, 164)}
        {bar(380, 227, 192)}{bar(380, 247, 142)}{chips(380, 292)}
      </>;
      break;
  }
  return <svg viewBox="0 0 640 400" className="block h-full w-full" aria-hidden="true" style={{ backgroundColor: theme.background, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }} data-experience-illustration={design}>{composition}</svg>;
}
