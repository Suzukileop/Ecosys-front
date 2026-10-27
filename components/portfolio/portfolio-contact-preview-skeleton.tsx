import type { PortfolioContactPremiumDesign } from './portfolio-contact-settings';

export function ContactPreviewSkeleton({ design, dark }: { design: PortfolioContactPremiumDesign; dark: boolean }) {
  const line = (x: number, y: number, width: number, height = 5, opacity = 0.16) => <rect x={x} y={y} width={width} height={height} rx={Math.min(3, height / 2)} opacity={opacity} />;
  const details = (x: number, y: number, width: number) => <>{line(x, y, 24, 3, 0.1)}{line(x, y + 15, width, 7)}{line(x, y + 48, 24, 3, 0.1)}{line(x, y + 63, width * 0.72, 7)}{line(x, y + 96, 24, 3, 0.1)}{line(x, y + 111, width * 0.82, 7)}</>;
  const portrait = (x: number, y: number, width: number, height: number) => <><rect x={x} y={y} width={width} height={height} rx="9" opacity="0.06" /><circle cx={x + width / 2} cy={y + height * 0.35} r={width * 0.14} opacity="0.1" /><rect x={x + width * 0.25} y={y + height * 0.58} width={width * 0.5} height={height * 0.3} rx="20" opacity="0.08" /></>;
  let body;
  switch (design) {
    case 'editorial-focus':
      body = <>{line(44, 90, 178, 24, 0.24)}{line(44, 126, 146, 24, 0.24)}{line(44, 162, 250, 24, 0.24)}{details(456, 84, 124)}</>;
      break;
    case 'split-grid':
      body = <>{details(44, 86, 112)}{line(298, 122, 294, 23, 0.25)}{line(470, 175, 122, 4, 0.12)}</>;
      break;
    case 'liquid-distortion':
      body = <>{line(44, 42, 142, 5)}{line(478, 65, 118, 5)}{line(70, 126, 500, 60, 0.08)}{line(44, 266, 124, 5)}{line(482, 266, 114, 5)}</>;
      break;
    case 'sequential-reveal':
      body = <>{portrait(188, 42, 264, 166)}{line(188, 239, 92, 5)}{line(310, 239, 92, 5)}{line(432, 239, 70, 5)}{line(188, 257, 70, 3, 0.1)}</>;
      break;
    case 'studio-overlap':
      body = <>{portrait(306, 38, 224, 242)}{line(44, 103, 356, 30, 0.25)}{line(44, 145, 302, 30, 0.23)}{line(44, 222, 172, 5)}</>;
      break;
    case 'broken-grid':
      body = <>{line(44, 45, 274, 30, 0.25)}{line(94, 88, 262, 30, 0.23)}{portrait(424, 52, 156, 172)}{line(44, 202, 160, 8)}{line(94, 236, 184, 5)}{line(378, 266, 156, 5)}</>;
      break;
    case 'numbered-narrative':
      body = <>{line(44, 48, 220, 22, 0.24)}{[112, 174, 236].map((y, i) => <g key={y}>{line(44, y, 18, 10, 0.12)}{line(106, y, [320, 244, 288][i], 11, 0.2)}{line(106, y + 22, 164, 3, 0.1)}</g>)}</>;
      break;
    case 'magnetic-overlap':
      body = <>{portrait(360, 44, 182, 224)}{line(44, 105, 372, 32, 0.25)}{line(44, 150, 310, 32, 0.23)}<circle cx="520" cy="232" r="30" opacity="0.12" />{line(44, 244, 152, 5)}</>;
      break;
  }
  return <svg viewBox="0 0 640 320" className="h-full w-full" aria-hidden="true" style={{ backgroundColor: dark ? '#171717' : '#f5f5f5', color: dark ? '#f5f5f5' : '#171717' }}><g fill="currentColor">{body}</g></svg>;
}
