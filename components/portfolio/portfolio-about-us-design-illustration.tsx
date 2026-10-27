'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import type { PortfolioAboutUsDesign } from './portfolio-about-us-settings';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';

/** Quiet layout silhouettes: the composition, not miniature prose, distinguishes designs. */
export function AboutUsDesignIllustration({ design }: { design: PortfolioAboutUsDesign }) {
  const theme = useThumbnailTheme('aboutUs');
  const t = useT();
  const mix = (n: number) => `color-mix(in srgb, ${theme.ink} ${n}%, ${theme.background})`;
  const media = (x: number, y: number, w: number, h: number, n = 8) => <g>
    <rect x={x} y={y} width={w} height={h} fill={mix(n)} />
    <rect x={x + w * 0.6} y={y} width={w * 0.4} height={h} fill={theme.accent} opacity="0.07" />
  </g>;
  const line = (x: number, y: number, w: number, strong = false) => <path d={`M${x} ${y}h${w}`} stroke={strong ? theme.ink : theme.muted} strokeWidth="3" opacity={strong ? 0.4 : 0.25} />;
  const title = (x: number, y: number, size = 40, serif = false, centered = false) => <text x={x} y={y} fill={theme.ink} fontSize={size} fontWeight={serif ? 400 : 500} fontFamily={serif ? "'Playfair Display', Georgia, serif" : undefined} letterSpacing="-1.2" textAnchor={centered ? 'middle' : undefined}>{t('About us')}</text>;
  let content;
  switch (design) {
    case 'stacked':
      content = <>{title(44, 83)}{line(44, 119, 434)}{line(44, 143, 342)}
        {media(44, 194, 268, 150)}{media(330, 194, 266, 150, 14)}
      </>;
      break;
    case 'split-overlap':
    case 'split-founder':
      content = <>{title(44, 111)}{line(44, 151, 250)}{line(44, 176, 198)}{line(44, 234, 224, true)}{line(44, 265, 182)}
        {media(350, 44, 206, 237)}{media(410, 198, 186, 152, 17)}
        {design === 'split-founder' ? <><circle cx="62" cy="325" r="17" fill={mix(18)} />{line(94, 325, 120)}</> : <path d="M44 318H112" stroke={theme.accent} strokeWidth="2" />}
      </>;
      break;
    case 'split-media-left':
      content = <>{media(44, 44, 246, 312)}{title(332, 111, 36)}{line(332, 155, 264)}{line(332, 180, 196)}{line(332, 245, 242, true)}{line(332, 284, 202)}<path d="M332 337H400" stroke={theme.accent} strokeWidth="2" /></>;
      break;
    case 'split-card':
      content = <><rect x="32" y="40" width="576" height="320" rx="12" fill={mix(4)} stroke={theme.border} />
        {media(44, 52, 238, 296)}{title(320, 120, 36)}{line(320, 163, 252)}{line(320, 188, 190)}
        <text x="320" y="277" fill={theme.accent} fontFamily="Georgia, serif" fontSize="56">“</text>{line(356, 264, 204)}{line(356, 288, 156)}
      </>;
      break;
    case 'split-quote':
      content = <>{title(44, 100, 36)}{line(44, 140, 238)}{line(44, 165, 190)}
        <rect x="44" y="216" width="248" height="132" rx="8" fill={mix(5)} />
        <text x="64" y="266" fill={theme.accent} fontFamily="Georgia, serif" fontSize="55">“</text>{line(102, 264, 162)}{line(102, 290, 116)}
        {[0, 1, 2, 3].map(i => <g key={i}>{media(346 + (i % 2) * 132, 52 + Math.floor(i / 2) * 150, 118, 136, 6 + i * 3)}
          <circle cx={405 + (i % 2) * 132} cy={120 + Math.floor(i / 2) * 150} r="24" fill="none" stroke={theme.ink} opacity="0.22" />
        </g>)}
      </>;
      break;
    case 'editorial':
      content = <>{title(44, 93, 58, true)}{media(44, 130, 552, 158)}
        <text x="64" y="191" fill={theme.ink} fontFamily="Georgia, serif" fontSize="52">“</text>{line(104, 181, 272)}
        <path d="M44 320H596" stroke={theme.border} />{line(44, 349, 140, true)}{line(242, 349, 144)}{line(440, 349, 132)}
      </>;
      break;
    case 'panorama':
      content = <>{title(44, 83)}{line(360, 65, 236)}{line(360, 89, 180)}{media(28, 130, 584, 154)}
        {line(44, 328, 220, true)}{line(44, 352, 174)}{line(360, 328, 232)}{line(360, 352, 174)}
      </>;
      break;
    case 'folio':
      content = <><path d="M44 40H596M44 316H596" stroke={theme.border} />{media(44, 65, 174, 224)}
        {title(266, 128, 46, true)}{line(266, 172, 316)}{line(266, 212, 260, true)}{line(266, 251, 224)}{line(148, 353, 344)}
      </>;
      break;
    case 'centered':
      content = <><circle cx="320" cy="83" r="40" fill={mix(12)} />
        {title(320, 188, 48, true, true)}<path d="M286 215H354" stroke={theme.accent} strokeWidth="2" />
        {line(140, 257, 360)}{line(190, 282, 260)}<path d="M110 323H530" stroke={theme.border} />{line(178, 351, 284)}
      </>;
      break;
  }
  return <svg viewBox="0 0 640 400" className="block h-full w-full" aria-hidden="true" data-about-us-design-illustration={design} style={{ background: theme.background, fontFamily: 'var(--font-app, ui-sans-serif), system-ui, sans-serif' }}>{content}</svg>;
}
