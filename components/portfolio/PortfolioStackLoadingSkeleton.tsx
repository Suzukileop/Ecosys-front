'use client';

import { StackPreviewSkeleton } from './portfolio-stack-preview-skeleton';
import { StackDesignWireframe } from './portfolio-stack-design-skeleton';
import { StackHeaderSkeleton } from './portfolio-stack-header-skeleton';
import type { PortfolioStackDesign, PortfolioStackHeaderDesign } from './portfolio-stack-settings';
import type { PortfolioSettings } from './portfolio-settings-types';

/** Same anatomy and palette in the catalogue and its loading iframe. */
export function PortfolioStackLoadingSkeleton({ section, design, settings }: {
 section: 'stack' | 'stackHeader';
 design: string;
 settings?: PortfolioSettings | null;
}) {
 return <div aria-busy="true" aria-label="Loading Stack preview" data-stack-loading={section} style={{width:'100%',height:section==='stackHeader'?480:426}}>
  <StackPreviewSkeleton settings={settings}>
   {section==='stackHeader' ? <StackHeaderSkeleton design={design as PortfolioStackHeaderDesign} compact/> : <StackDesignWireframe design={design as PortfolioStackDesign}/>}
  </StackPreviewSkeleton>
 </div>;
}
