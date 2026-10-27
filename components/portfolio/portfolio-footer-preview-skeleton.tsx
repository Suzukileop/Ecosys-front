import type { PortfolioFooterDesign } from './portfolio-footer-settings';

/** Sparse silhouettes of the real footer layouts; inherits the preview's light/dark mode. */
export function FooterPreviewSkeleton({ design, dark }: { design: PortfolioFooterDesign; dark: boolean }) {
  const line = (x: number, y: number, width: number, height = 5, opacity = 0.16) => (
    <rect x={x} y={y} width={width} height={height} rx={Math.min(height / 2, 3)} opacity={opacity} />
  );
  const rows = (x: number, y: number, width: number) => <>{line(x, y, width)}{line(x, y + 18, width * 0.8)}{line(x, y + 36, width * 0.65)}</>;
  const dots = (x: number, y: number) => <>{[0, 1, 2, 3].map(i => <circle key={i} cx={x + i * 22} cy={y} r="3" opacity="0.2" />)}</>;
  let body;
  switch (design) {
    case 'centered-minimal':
      body = <>{line(252, 112, 136, 12, 0.25)}{line(270, 146, 100)}{dots(287, 183)}{line(232, 218, 176, 3, 0.1)}</>;
      break;
    case 'landing':
      body = <>{line(44, 98, 138, 12, 0.25)}{rows(44, 134, 182)}{dots(47, 206)}{line(304, 98, 42, 4)}{rows(304, 132, 102)}{line(482, 98, 42, 4)}{rows(482, 132, 82)}</>;
      break;
    case 'compact':
      body = <>{line(44, 102, 138, 12, 0.25)}{rows(44, 138, 216)}{dots(488, 113)}{line(44, 222, 96, 3, 0.1)}</>;
      break;
    case 'minimal':
      body = <>{line(44, 95, 138, 12, 0.25)}{rows(44, 130, 192)}<rect x="44" y="200" width="90" height="25" rx="12" opacity="0.08" />{rows(310, 98, 112)}{dots(313, 202)}<rect x="494" y="78" width="100" height="160" rx="9" opacity="0.08" /></>;
      break;
    case 'contact-card':
      body = <><rect x="94" y="74" width="270" height="172" rx="14" opacity="0.07" />{line(118, 102, 136, 14, 0.25)}{rows(118, 145, 162)}{rows(414, 110, 98)}</>;
      break;
    case 'split-form':
      body = <><rect x="44" y="56" width="232" height="206" rx="12" opacity="0.06" />{line(66, 86, 144, 14, 0.25)}{rows(66, 132, 166)}{dots(69, 222)}{rows(330, 82, 254)}{line(330, 182, 230, 2, 0.1)}{line(330, 220, 104, 9)}</>;
      break;
    case 'timezone-editorial':
      body = <>{line(44, 106, 222, 21, 0.24)}{line(44, 140, 160, 21, 0.24)}<rect x="44" y="206" width="104" height="24" rx="12" opacity="0.08" />{line(420, 102, 160, 30, 0.22)}{rows(420, 178, 100)}</>;
      break;
    case 'hero-columns':
      body = <>{line(44, 45, 350, 30, 0.25)}{line(44, 87, 260, 24, 0.2)}<rect x="44" y="159" width="84" height="108" rx="8" opacity="0.08" />{rows(216, 164, 118)}{rows(436, 164, 136)}</>;
      break;
    case 'inverted-wordmark':
      body = <>{rows(44, 70, 160)}{rows(300, 70, 100)}{rows(480, 70, 100)}<g transform="translate(640 480) rotate(180)">{line(44, 208, 552, 54, 0.18)}</g></>;
      break;
    case 'services-reveal':
      body = <>{rows(44, 64, 138)}{rows(272, 64, 116)}{rows(468, 64, 118)}{line(44, 205, 552, 46, 0.2)}</>;
      break;
    case 'editorial-grid':
      body = <>{line(44, 44, 552, 42, 0.24)}<rect x="44" y="122" width="262" height="144" rx="14" opacity="0.07" />{line(66, 147, 178, 12, 0.22)}<circle cx="265" cy="229" r="14" opacity="0.16" />{rows(362, 138, 100)}{rows(500, 138, 84)}</>;
      break;
    case 'headline-reveal':
      body = <>{line(44, 62, 460, 34, 0.25)}{line(44, 108, 346, 34, 0.2)}{rows(44, 204, 136)}{dots(476, 220)}</>;
      break;
    case 'dispatch':
      body = <>{line(44, 50, 52, 4)}{line(44, 82, 328, 26, 0.25)}{rows(44, 142, 172)}{rows(350, 142, 100)}{rows(506, 142, 80)}{line(44, 266, 552, 2, 0.08)}</>;
      break;
    case 'monumental':
      body = <>{line(44, 42, 338, 34, 0.25)}{line(44, 88, 266, 34, 0.22)}{rows(418, 74, 172)}{line(418, 156, 130, 10)}{line(44, 226, 552, 36, 0.08)}</>;
      break;
  }
  return <svg viewBox="0 0 640 320" className="h-full w-full" aria-hidden="true" style={{ backgroundColor: dark ? '#171717' : '#f5f5f5', color: dark ? '#f5f5f5' : '#171717' }}><g fill="currentColor">{body}</g></svg>;
}
