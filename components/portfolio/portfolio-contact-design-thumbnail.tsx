'use client';
import type {PortfolioContactPremiumDesign} from '@/components/portfolio/portfolio-contact-settings';
export function ContactDesignThumbnail({design,mode='light',priority=false}:{design:PortfolioContactPremiumDesign;mode?:'light'|'dark';priority?:boolean}){
  return (
    // Precompressed screenshots of real components, not live pages.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/portfolio-previews/contacts/${design}-${mode}.webp?v=1`} alt="" loading={priority?'eager':'lazy'} decoding="async" className="block h-auto w-full" data-contact-static-preview={design}/>
  );
}
