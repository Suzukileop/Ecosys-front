'use client';
import { StackPreviewSkeleton } from './portfolio-stack-preview-skeleton';
import { InfoDesignSkeleton } from './portfolio-info-design-skeleton';
import type { PortfolioInfoDesign } from './portfolio-info-settings';
import type { PortfolioSettings } from './portfolio-settings-types';

export function PortfolioInfoLoadingSkeleton({design,settings}:{design:PortfolioInfoDesign;settings?:PortfolioSettings|null}){
 return <div aria-busy="true" aria-label="Loading Info preview" data-info-loading={design} style={{width:'100%',height:design==='about-me'?'auto':520}}><StackPreviewSkeleton section="info" settings={settings}><InfoDesignSkeleton design={design}/></StackPreviewSkeleton></div>;
}
