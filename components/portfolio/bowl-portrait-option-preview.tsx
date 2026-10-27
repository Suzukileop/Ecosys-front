import type { PortfolioHeroBowlIntroMotif, PortfolioHeroPortraitShape } from './portfolio-hero-banner-settings';
import { portraitShapeOverlayStyle, portraitShapeRadius } from './hero-variants/portrait-shape';

/** Fixed, lightweight illustrations: motifs do not change with the selected portrait. */
export function BowlPortraitOptionPreview({ shape = 'auto', motif, defaultMotif = 'bowl' }: {
  shape?: PortfolioHeroPortraitShape;
  motif?: PortfolioHeroBowlIntroMotif;
  defaultMotif?: PortfolioHeroBowlIntroMotif;
}) {
  if (motif) return <svg viewBox="0 0 100 76" className="block h-[76px] w-full" aria-hidden="true" fill="none">
    {motif === 'bowl' ? <path d="M16 44H84C84 76 16 76 16 44Z" fill="var(--np-accent)" fillOpacity="0.22" stroke="var(--np-accent)" /> : null}
    {motif === 'hug' ? <rect x="24" y="5" width="52" height="65" rx="25" stroke="var(--np-accent)" strokeWidth="1.5" /> : null}
    {motif === 'orbs-top' ? <>
      <circle cx="27" cy="20" r="13" fill="var(--np-accent)" fillOpacity="0.35" />
      <circle cx="74" cy="26" r="9" stroke="var(--np-accent)" />
    </> : null}
    {motif === 'orbs-bottom' ? <>
      <rect x="23" y="16" width="45" height="54" rx="8" stroke="var(--np-accent)" strokeWidth="1.5" />
      <rect x="30" y="9" width="45" height="54" rx="8" fill="var(--np-card)" stroke="var(--np-accent)" strokeWidth="1.5" />
    </> : null}
  </svg>;
  const accent = 'var(--np-accent)';
  const background = 'var(--np-card)';
  const radius = portraitShapeRadius(shape) ?? (defaultMotif === 'orbs-bottom' ? '2rem 2rem 46% 2rem' : defaultMotif === 'orbs-top' ? '2rem' : '2rem 2rem 42% 42% / 2rem 2rem 16% 16%');
  const overlay = portraitShapeOverlayStyle(shape, accent, background);
  return <span className="relative block h-[76px] w-full" aria-hidden>
    <span className="absolute left-1/2 top-1/2 block w-[240px] origin-center" style={{ height: shape === 'circle' ? 240 : 320, transform: 'translate(-50%, -50%) scale(0.18)' }}>
      {shape === 'offset' ? <span className="absolute inset-0 translate-x-[0.9rem] translate-y-[0.9rem] border-[1.5px]" style={{ borderColor: accent }} /> : null}
      <span className="absolute inset-0 overflow-hidden" style={{ borderRadius: radius, backgroundColor: 'var(--np-illus)' }}>
        <span className="absolute left-1/2 top-[18%] size-[30%] -translate-x-1/2 rounded-full" style={{ backgroundColor: 'var(--np-illus-strong)' }} />
        <span className="absolute bottom-[9%] left-1/2 h-[37%] w-[66%] -translate-x-1/2 rounded-t-full" style={{ backgroundColor: 'var(--np-illus-strong)' }} />
        {overlay ? <span className="absolute inset-0" style={overlay} /> : null}
      </span>
    </span>
  </span>;
}
