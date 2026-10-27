'use client';
import { StackPreviewSkeleton } from './portfolio-stack-preview-skeleton';
import { ToolsDesignWireframe } from './portfolio-tools-design-skeleton';
import type { PortfolioToolsDesign } from './portfolio-tools-settings';
import type { PortfolioSettings } from './portfolio-settings-types';

/** Design only: no duplicate header or header spacing while loading. */
export function PortfolioToolsLoadingSkeleton({ design, settings }: {design: PortfolioToolsDesign; settings?: PortfolioSettings | null}) {
 return <div aria-busy="true" aria-label="Loading Tools preview" data-tools-loading={design} style={{width:'100%',height:426}}><StackPreviewSkeleton section="tools" settings={settings}><ToolsDesignWireframe design={design}/></StackPreviewSkeleton></div>;
}
