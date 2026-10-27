'use client';
import type {PortfolioGalleryDesign} from '@/components/portfolio/portfolio-gallery-settings';
export function GalleryDesignThumbnail({design,priority=false}:{design:PortfolioGalleryDesign;priority?:boolean}){
 return (
   // Precompressed capture, not an iframe or an image generated from an imagined layout.
   // eslint-disable-next-line @next/next/no-img-element
   <img src={`/portfolio-previews/gallery/${design}-light.webp?v=1`} alt="" loading={priority?'eager':'lazy'} decoding="async" className="block h-auto w-full" data-gallery-static-preview={design}/>
 );
}
