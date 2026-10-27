'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const ToolsHeaderEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./ToolsHeaderEditorialHeader').then((m) => m.ToolsHeaderEditorialHeader)));
export const ToolsHeaderMarqueeHeader = withSectionHeaderTypography(dynamic(() => import('./ToolsHeaderMarqueeHeader').then((m) => m.ToolsHeaderMarqueeHeader)));
export const ToolsHeaderIndexHeader = withSectionHeaderTypography(dynamic(() => import('./ToolsHeaderIndexHeader').then((m) => m.ToolsHeaderIndexHeader)));
export const ToolsHeaderAccentCountHeader = withSectionHeaderTypography(dynamic(() => import('./ToolsHeaderAccentCountHeader').then((m) => m.ToolsHeaderAccentCountHeader)));
export const ToolsHeaderSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./ToolsHeaderSerifLeadHeader').then((m) => m.ToolsHeaderSerifLeadHeader)));
export const ToolsHeaderBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./ToolsHeaderBillboardHeader').then((m) => m.ToolsHeaderBillboardHeader)));
export const ToolsHeaderMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./ToolsHeaderMastheadHeader').then((m) => m.ToolsHeaderMastheadHeader)));
export const ToolsHeaderSplitHeadingHeader = withSectionHeaderTypography(dynamic(() => import('./ToolsHeaderSplitHeadingHeader').then((m) => m.ToolsHeaderSplitHeadingHeader)));
