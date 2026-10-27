import type { PortfolioHeroBowlIntroMotif, PortfolioHeroPortraitShape } from '../portfolio-hero-banner-settings';
import { portraitShapeRadius } from './portrait-shape';

/** Decorations remain outside the image crop and work with every portrait shape. */
export function BowlPortraitMotif({ motif, shape, principal, fond }: {
  motif: PortfolioHeroBowlIntroMotif;
  shape?: PortfolioHeroPortraitShape;
  principal: string;
  fond: string;
}) {
  const radius = portraitShapeRadius(shape) ?? (motif === 'orbs-bottom' ? '2rem 2rem 46% 2rem' : motif === 'orbs-top' ? '2rem' : '2rem 2rem 42% 42% / 2rem 2rem 16% 16%');
  const border = `1px solid color-mix(in srgb, ${principal} 65%, transparent)`;
  return <div aria-hidden className="pointer-events-none absolute inset-0 z-0" data-portrait-motif={motif}>
    {motif === 'bowl' ? <span className="absolute -inset-x-[9%] -bottom-[6%] h-[52%]" style={{ border, backgroundColor: `color-mix(in srgb, ${principal} 12%, ${fond})`, borderRadius: '0 0 50% 50% / 0 0 100% 100%' }} /> : null}
    {motif === 'hug' ? <span className="absolute -inset-[4%]" style={{ border, borderRadius: radius }} /> : null}
    {motif === 'orbs-top' ? <>
      <span className="absolute -left-[13%] -top-[5%] aspect-square w-[43%] rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${principal} 28%, ${fond})` }} />
      <span className="absolute -right-[9%] top-[7%] aspect-square w-[28%] rounded-full" style={{ border }} />
    </> : null}
    {motif === 'orbs-bottom' ? <span className="absolute inset-0 -translate-x-[9%] translate-y-[7%]" style={{ border, borderRadius: radius }} /> : null}
  </div>;
}
