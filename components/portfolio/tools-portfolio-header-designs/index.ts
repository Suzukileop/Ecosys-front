'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const ToolsHeaderEditorialHeader = dynamic(() => import('./ToolsHeaderEditorialHeader').then((m) => m.ToolsHeaderEditorialHeader));
export const ToolsHeaderMarqueeHeader = dynamic(() => import('./ToolsHeaderMarqueeHeader').then((m) => m.ToolsHeaderMarqueeHeader));
export const ToolsHeaderIndexHeader = dynamic(() => import('./ToolsHeaderIndexHeader').then((m) => m.ToolsHeaderIndexHeader));
export const ToolsHeaderAccentCountHeader = dynamic(() => import('./ToolsHeaderAccentCountHeader').then((m) => m.ToolsHeaderAccentCountHeader));
export const ToolsHeaderSerifLeadHeader = dynamic(() => import('./ToolsHeaderSerifLeadHeader').then((m) => m.ToolsHeaderSerifLeadHeader));
export const ToolsHeaderBillboardHeader = dynamic(() => import('./ToolsHeaderBillboardHeader').then((m) => m.ToolsHeaderBillboardHeader));
export const ToolsHeaderMastheadHeader = dynamic(() => import('./ToolsHeaderMastheadHeader').then((m) => m.ToolsHeaderMastheadHeader));
export const ToolsHeaderSplitHeadingHeader = dynamic(() => import('./ToolsHeaderSplitHeadingHeader').then((m) => m.ToolsHeaderSplitHeadingHeader));
