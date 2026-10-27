'use client';
import type {PortfolioFaqDesign} from './portfolio-faq-settings';
import {FaqKineticThumbnailFrame} from './portfolio-faq-kinetic-thumbnail-frame';

/** Isolated real-component previews, with no second portfolio application. */
export function FaqDesignThumbnail({design}:{design:PortfolioFaqDesign;priority?:boolean}){
  return <FaqKineticThumbnailFrame design={design}/>;
}
