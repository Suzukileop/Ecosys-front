'use client';

import { DEFAULT_PROJECTS_DUOTONE_SETTINGS, mergeProjectsDuotoneSettings, DEFAULT_PROJECTS_FRAMES_SETTINGS, mergeProjectsFramesSettings, DEFAULT_PROJECTS_INDEX_SETTINGS, mergeProjectsIndexSettings, DEFAULT_PROJECTS_CAROUSEL_SETTINGS, mergeProjectsCarouselSettings, DEFAULT_PROJECTS_SHOWCASE_SETTINGS, mergeProjectsShowcaseSettings, type PortfolioWorkSectionDesign } from './portfolio-work-settings';
import { resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import { useT } from '@/lib/i18n/I18nProvider';
import { usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';

const SANS = 'var(--font-app, ui-sans-serif), system-ui, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
// Ratios are thumbnail-sized; weights, families and tracking mirror the real layouts.
const TITLE_TYPE: Record<PortfolioWorkSectionDesign, { weight: number; tracking: string; family?: string; scale?: number }> = {
  'projects-board': { weight: 700, tracking: '-0.025em' },
  'projects-accordion': { weight: 600, tracking: '-0.03em' },
  'projects-frames': { weight: 500, tracking: '-0.025em' },
  'projects-index': { weight: 600, tracking: '-0.045em', scale: 1.12 },
  'projects-grid': { weight: 600, tracking: '-0.035em' },
  'projects-split': { weight: 600, tracking: '-0.038em' },
  'projects-carousel': { weight: 500, tracking: '-0.035em' },
  'projects-showcase': { weight: 600, tracking: '-0.045em' },
  'projects-ledger': { weight: 500, tracking: '-0.042em' },
  'projects-spec': { weight: 500, tracking: '-0.045em' },
  'projects-case': { weight: 400, tracking: '-0.055em', scale: 1.12 },
  'projects-press': { weight: 600, tracking: '0em' },
  'projects-duotone': { weight: 400, tracking: '-0.02em', family: "'Fraunces', Georgia, serif", scale: 1.18 },
  'projects-cascade': { weight: 400, tracking: '0em', family: "'Playfair Display', Georgia, serif", scale: 1.18 },
};

/** Theme-aware colour panels and typography, without image requests or preview iframes. */
export function WorkDesignIllustration({ design }: { design: PortfolioWorkSectionDesign }) {
  const theme = useThumbnailTheme('work');
  const t = useT();
  const source = usePortfolioDesignPreviewSource();
  const displayFrames = design === 'projects-frames' && source?.settings.work.projectsFrames?.titleStyle === 'display';
  const type = TITLE_TYPE[design];
  const text = (x: number, y: number, value: string, size = 29, weight?: number) => <text x={x} y={y} fill={theme.ink} fontFamily={type.family ?? SANS} fontSize={size * (displayFrames ? 1.12 : type.scale ?? 1)} fontWeight={weight ?? (displayFrames ? 900 : type.weight)} letterSpacing={displayFrames ? '-0.045em' : type.tracking}>{value}</text>;
  const label = (x: number, y: number, value: string) => <text x={x} y={y} fill={theme.muted} fontFamily={/^[\d /]+$/.test(value) ? MONO : SANS} fontSize="18" fontWeight="500" letterSpacing="0.1em">{value.toUpperCase()}</text>;
  // Hairline editorial rules, not loading-placeholder bars.
  const bar = (x: number, y: number, width: number) => <path d={`M${x} ${y}h${width}`} stroke={theme.border} strokeWidth="1" />;
  const titles: Partial<Record<PortfolioWorkSectionDesign, string[]>> = {
    'projects-index': ['Galerie'], 'projects-grid': ['Cobalt', 'Botanica', 'Edition'],
    'projects-split': ['Essence'], 'projects-carousel': ['Maison', 'Lumiere'],
    'projects-showcase': ['Lumiere'], 'projects-case': ['Herbier'],
    'projects-press': ['Silhouette', 'Studio'], 'projects-duotone': ['Aqua'],
    'projects-cascade': ['Edition'],
  };
  const project = (i: number) => (titles[design] ?? ['Forma', 'Maison', 'Atelier'])[i - 1] ?? 'Forma';
  const media = (x: number, y: number, width: number, height: number, i = 0) => {
    const strength = [24, 38, 52][i % 3];
    return <rect x={x} y={y} width={width} height={height}
      fill={`color-mix(in srgb, ${theme.ink} ${strength}%, ${theme.background})`}
      stroke={theme.border} strokeWidth="1" />;
  };
  const card = (x: number, y: number, width: number, height: number) => <rect x={x} y={y} width={width} height={height} fill={theme.background} stroke={theme.border} />;
  let content;
  switch (design) {
    case 'projects-board':
      content = <>{[40, 332].map((x, i) => <g key={x}>
        {media(x, i ? 66 : 30, 268, 210, i)}
        {text(x, i ? 312 : 276, project(i + 1), 32)}
        {label(x, i ? 339 : 303, i ? t('Edition') : t('Branding'))}
        {text(x + 238, i ? 312 : 276, '↗', 27, 400)}
      </g>)}</>;
      break;
    case 'projects-accordion':
      content = <>{media(322, 42, 278, 273)}{[82, 169, 256].map((y, i) => <g key={y}>
        {text(40, y, project(i + 1), i ? 26 : 42, i ? 400 : 600)}{i === 0 ? label(40, y + 31, t('Branding')) : null}
        <path d={`M40 ${y + 58}H285`} stroke={theme.border} />
      </g>)}</>;
      break;
    case 'projects-frames': {
      const frames = mergeProjectsFramesSettings(DEFAULT_PROJECTS_FRAMES_SETTINGS, source?.settings.work.projectsFrames);
      const imageWidth = {md:250,lg:280,xl:330,xxl:360,half:272}[frames.thumbnailSize];
      const imageX = frames.imageSide === 'right' ? 600-imageWidth : 40;
      const copyX = frames.imageSide === 'right' ? 40 : imageX+imageWidth+32;
      const radius = frames.radius === 'none' ? 0 : frames.radius === 'md' ? 20 : 42;
      content = <>
        {frames.showRole ? <text x="40" y="38" fill={theme.accent} fontFamily={SANS} fontSize="13" letterSpacing="0.12em">DESIGNER</text> : null}
        {frames.showCategory ? <text x={frames.showRole?145:40} y="38" fill={theme.muted} fontFamily={SANS} fontSize="13" letterSpacing="0.12em">WEB DESIGN</text> : null}
        <path d={`M${imageX+radius} 60H${imageX+imageWidth}V${270-radius}Q${imageX+imageWidth} 270 ${imageX+imageWidth-radius} 270H${imageX}V${60+radius}Q${imageX} 60 ${imageX+radius} 60Z`}
          fill={`color-mix(in srgb, ${theme.ink} 24%, ${theme.background})`} />
        {text(imageX, 310, 'Botanica', frames.titleSize != null
          ? Math.min(52, Math.max(16, (displayFrames?42:32) * frames.titleSize / (displayFrames?96:52)))
          : displayFrames?42:32)}
        {frames.showDescription ? <text x={copyX} y="190" fill={theme.muted} fontFamily={SANS} fontSize="15" fontWeight="400">
          <tspan x={copyX}>Une identité singulière,</tspan><tspan x={copyX} dy="23">pensée pour inspirer.</tspan><tspan x={copyX} dy="23">Du concept au détail.</tspan>
        </text> : null}
        {frames.showStack ? <text x={copyX} y="266" fill={theme.muted} fontFamily={MONO} fontSize="11" letterSpacing="0.08em">FIGMA · WEBFLOW</text> : null}
      </>;
      break;
    }
    case 'projects-split':
    case 'projects-case':
      content = <>{media(40, 52, design === 'projects-split' ? 300 : 272, 254)}
        {label(370, 86, '01 / 03')}{text(370, 145, project(1), 34)}
        {label(370, 184, t('Branding'))}
        {design === 'projects-case' ? <><path d="M370 224H590M370 266H590" stroke={theme.border}/>{label(370, 251, '2026')}</> : <path d="M370 249H454" stroke={theme.accent} strokeWidth="2" />}
      </>;
      break;
    case 'projects-index': {
      const indexSettings=mergeProjectsIndexSettings(DEFAULT_PROJECTS_INDEX_SETTINGS,source?.settings.work.projectsIndex);
      // Full-bleed scene: number above title, tools and description share the bottom row.
      // Neutral blocks describe content hierarchy without suggesting boxed title cards.
      content = <>{media(0, 0, 640, 360)}
        <rect x="0" y="180" width="640" height="180" fill={theme.background} opacity="0.2"/>
        {indexSettings.showNumber?<g>
          <path d="M48 218H68" stroke={theme.accent} strokeWidth="2"/>
          <rect x="80" y="214" width="28" height="7" rx="2" fill={theme.ink} opacity=".75"/>
          <rect x="118" y="214" width="36" height="7" rx="2" fill={theme.ink} opacity=".4"/>
        </g>:null}
        <rect x="48" y="241" width="296" height="32" rx="3" fill={theme.ink} opacity=".85"/>
        {indexSettings.showStack?<g fill={theme.ink} opacity=".55">
          {[48,108,168,228].map(x=><rect key={x} x={x} y="322" width="45" height="5" rx="1"/>)}
        </g>:null}
        {indexSettings.showDescription?<g fill={theme.ink} opacity=".55">
          <rect x="398" y="291" width="194" height="5" rx="2"/>
          <rect x="418" y="306" width="174" height="5" rx="2"/>
          <rect x="442" y="321" width="150" height="5" rx="2"/>
        </g>:null}
      </>;
      break;
    }
    case 'projects-grid': {
      const count=source?.settings.work.projectsGrid?.columnsPerRow??2;
      const width=(560-(count-1)*18)/count;
      content = <>{Array.from({length:count},(_,i)=>{
        const x=40+i*(width+18);
        return <g key={i}>{media(x,44,width,184,i)}{text(x,270,project(i+1),count===4?21:25)}
          <text x={x} y="303" fill={theme.muted} fontFamily={SANS} fontSize={count===4?13:16} letterSpacing=".08em">{['DESIGN','BRANDING','EDITION','WEB'][i]}</text>
        </g>;
      })}</>;
      break;
    }
    case 'projects-carousel': {
      // The real layout: slides of one size on a track clipped by the section, the current one at full
      // size, the rest faded only in focus mode; under them the counter, the project
      // title, Prev / Next and the hairline progress rule.
      const carousel = mergeProjectsCarouselSettings(DEFAULT_PROJECTS_CAROUSEL_SETTINGS, source?.settings.work.projectsCarousel);
      const h = 172;
      const w = carousel.aspectRatio === 'landscape' ? Math.round(h * 4 / 3) : carousel.aspectRatio === 'portrait' ? Math.round(h * 3 / 4) : h;
      const gap = carousel.gap === 'tight' ? 8 : carousel.gap === 'xl' ? 34 : 20;
      const radius = carousel.imageRadius === 'none' ? 0 : carousel.imageRadius === 'md' ? 8 : 16;
      const top = 36;
      const slides = [];
      for (let i = 0; 40 + i * (w + gap) < 600; i += 1) {
        const current = i === 0;
        const scale = current || !carousel.focusDim ? 1 : 0.96;
        const sw = w * scale;
        const sh = h * scale;
        // Slots are all one width; a receded slide sits centred in its slot, on the baseline.
        const x = 40 + i * (w + gap) + (w - sw) / 2;
        const y = top + h - sh;
        // Focus mode fades everything but the focused slide; otherwise every slide is clear.
        const opacity = current ? 1 : carousel.focusDim ? carousel.focusOpacity / 100 : 1;
        slides.push(<g key={i} opacity={opacity}>
          <rect x={x} y={y} width={sw} height={sh} rx={radius}
            fill={`color-mix(in srgb, ${theme.ink} ${[24, 38, 52][i % 3]}%, ${theme.background})`} stroke={theme.border} strokeWidth="1" />
          {carousel.showNumbers ? <g>
            <rect x={x + 10} y={y + 10} width="38" height="22" rx="2" fill="#000" fillOpacity=".55" />
            <text x={x + 29} y={y + 25.5} textAnchor="middle" fill="#fff" fontFamily={MONO} fontSize="13" letterSpacing="0.12em">{String(i + 1).padStart(2, '0')}</text>
          </g> : null}
        </g>);
      }
      content = <>
        <defs><clipPath id="work-carousel-track"><rect x="0" y="0" width="600" height="360" /></clipPath></defs>
        <g clipPath="url(#work-carousel-track)">{slides}</g>
        {carousel.showNumbers ? <text x="40" y="244" fill={theme.muted} fontFamily={MONO} fontSize="15" letterSpacing="0.22em">01 — 03</text> : null}
        {text(40, carousel.showNumbers ? 284 : 270, project(1), 34)}
        <text x="40" y={carousel.showNumbers ? 310 : 296} fill={theme.muted} fontFamily={SANS} fontSize="15" letterSpacing="0.04em">{t('Branding')}</text>
        <text x="458" y="296" fill={theme.ink} fontFamily={SANS} fontSize="14" fontWeight="600" letterSpacing="0.22em">{t('Prev').toUpperCase()}</text>
        <text x="600" y="296" textAnchor="end" fill={theme.ink} fontFamily={SANS} fontSize="14" fontWeight="600" letterSpacing="0.22em">{t('Next').toUpperCase()}</text>
        <path d="M40 336H600" stroke={theme.border} strokeWidth="1" />
        <path d="M40 336H260" stroke={theme.ink} strokeWidth="1.5" />
      </>;
      break;
    }
    case 'projects-showcase': {
      // Real stage: tall media on one side; index, title, copy, category, then chevrons and the
      // three-thumb strip anchored at the foot of the other column.
      const showcase = mergeProjectsShowcaseSettings(DEFAULT_PROJECTS_SHOWCASE_SETTINGS, source?.settings.work.projectsShowcase);
      const mediaX = showcase.mediaSide === 'right' ? 330 : 40;
      const copyX = showcase.mediaSide === 'right' ? 40 : 362;
      const rx = (radius: string, md: number, xl: number) => (radius === 'none' ? 0 : radius === 'md' ? md : xl);
      const fill = (i: number) => `color-mix(in srgb, ${theme.ink} ${[24, 38, 52][i % 3]}%, ${theme.background})`;
      content = <>
        <rect x={mediaX} y="30" width="270" height="300" rx={rx(showcase.mediaRadius, 12, 24)} fill={fill(0)} stroke={theme.border} />
        {showcase.showIndex ? <>
          <text x={copyX} y="58" fill={theme.accent} fontFamily={MONO} fontSize="14" letterSpacing="0.12em">01</text>
          <path d={`M${copyX + 30} 53h28`} stroke={theme.accent} opacity=".55" />
          <text x={copyX + 66} y="58" fill={theme.muted} fontFamily={MONO} fontSize="14" letterSpacing="0.12em">04</text>
        </> : null}
        {text(copyX, showcase.showIndex ? 104 : 74, project(1), 36)}
        {showcase.showDescription ? [0, 1, 2].map(i => <g key={i}>{bar(copyX, (showcase.showIndex ? 128 : 98) + i * 14, [228, 206, 150][i])}</g>) : null}
        {showcase.showCategory ? label(copyX, 192, showcase.categoryLabel || 'Category') : null}
        <path d={`M${copyX + 6} 216l-5 5 5 5`} stroke={theme.ink} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {showcase.navHover === 'circle' ? <><circle cx={copyX + 4} cy="221" r="10" stroke={theme.border} fill="none" /><circle cx={copyX + (showcase.showCounter ? 86 : 30)} cy="221" r="10" stroke={theme.border} fill="none" /></> : null}
        {showcase.showCounter ? <text x={copyX + 45} y="226" textAnchor="middle" fill={theme.muted} fontFamily={MONO} fontSize="13" letterSpacing="0.1em">01 / 04</text> : null}
        <path d={`M${copyX + (showcase.showCounter ? 84 : 28)} 216l5 5-5 5`} stroke={theme.ink} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {[0, 1, 2].map(i => <rect key={i} x={copyX + i * 83} y="242" width="72" height="88" rx={rx(showcase.thumbRadius, 6, 12)} fill={fill(i + 1)} stroke={theme.border} />)}
      </>;
      break;
    }
    case 'projects-ledger':
    case 'projects-spec':
      content = <>{[84, 174, 264].map((y, i) => <g key={y}>
        {label(40, y, String(i + 1).padStart(2, '0'))}{text(106, y, project(i + 1), 34)}
        {design === 'projects-spec' ? <>{label(428, y, '2026')}{label(106, y + 28, ['Branding', 'Architecture', 'Edition'][i])}</> : label(428, y, ['Branding', 'Interior', 'Edition'][i])}
        <path d={`M40 ${y + 40}H600`} stroke={theme.border} />
      </g>)}</>;
      break;
    case 'projects-press':
      content = <>{[48, 206].map((y, i) => <g key={y}>
        {media(40, y, 174, 122, i)}{label(250, y + 28, '2026')}{text(250, y + 76, project(i + 1), 34)}{bar(250, y + 104, 276)}
      </g>)}</>;
      break;
    case 'projects-duotone': {
      const duotone = mergeProjectsDuotoneSettings(DEFAULT_PROJECTS_DUOTONE_SETTINGS, source?.settings.work.projectsDuotone);
      const metaInk = duotone.metaColor === 'muted' ? theme.muted : resolveHeroPaletteColor(theme.palette, duotone.metaColor);
      const detail = (x: number, top: number, width: number) => <g>
        <text x={x} y={top} fill={metaInk} fontFamily={SANS} fontSize="13" letterSpacing="0.08em">DESIGNER · BRANDING</text>
        {[0, 1, 2, 3].map(i => <rect key={i} x={x} y={top + 24 + i * 20} width={i === 3 ? width * 0.55 : width} height="6" rx="3" fill={theme.ink} opacity=".35" />)}
        <path d={`M${x} ${top + 118}h${width}`} stroke={theme.border} />
        {[0, 1, 2].map(i => <rect key={i} x={x + i * 66} y={top + 134} width="58" height="20" fill="none" stroke={theme.muted} opacity=".7" />)}
        <text x={x} y={top + 190} fill={theme.accent} fontFamily={SANS} fontSize="15" fontWeight="600">{t('View project')} →</text>
      </g>;
      if (duotone.scrollMode === 'slide') {
        content = <>
          <rect x="24" y="24" width="592" height="312" rx={duotone.frameColor === 'none' ? 0 : 14} fill="none" stroke={duotone.frameColor === 'none' ? 'none' : theme.border} />
          <circle cx="552" cy="52" r="11" fill={theme.accent} opacity=".18" /><circle cx="584" cy="52" r="11" fill={theme.accent} opacity=".18" />
          {text(56, 126, project(1), 40)}{media(56, 148, 240, 140)}
          <rect x="332" y="88" width="252" height="220" rx="12" fill={theme.card} stroke={theme.border} />
          {detail(356, 124, 204)}
          {label(56, 316, '01 / 03')}
        </>;
        break;
      }
      const mediaX = duotone.swapSides ? 310 : 40;
      const infoX = duotone.swapSides ? 40 : 360;
      content = <>
        {text(mediaX, 118, project(1), 50)}{media(mediaX, 140, 290, 190)}
        {detail(infoX, 150, 240)}
      </>;
      break;
    }
    case 'projects-cascade':
      content = <>{[0, 1, 2].map(i => <g key={i}>{card(56 - i * 8, 38 + i * 20, 528 + i * 16, 254)}
        {i === 2 ? <>{media(52, 90, 236, 206)}{label(324, 134, '01 / 03')}{text(324, 194, project(1), 34)}{bar(324, 225, 204)}</> : null}
      </g>)}</>;
      break;
  }
  return <svg viewBox="0 0 640 360" className="block h-full w-full" aria-hidden="true" style={{ backgroundColor: theme.background, fontFamily: SANS }} data-work-design-illustration={design}>{content}</svg>;
}
