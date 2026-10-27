'use client';

import type { PortfolioFooterDesign } from '@/components/portfolio/portfolio-footer-settings';

/** Generated from real footer components; no iframe or account data is loaded. */
export function FooterDesignThumbnail({design,mode='light',priority=false}:{design:PortfolioFooterDesign;mode?:'light'|'dark';priority?:boolean}) {
  return (
    // These small, precompressed local assets need no runtime image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/portfolio-previews/footers/${design}-${mode}.webp?v=4`} alt="" loading={priority?'eager':'lazy'} decoding="async" className="block h-auto w-full" data-footer-static-preview={design}/>
  );
}
