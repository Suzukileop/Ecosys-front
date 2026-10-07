'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const WorkEditorialHeader = dynamic(() => import('./WorkEditorialHeader').then((m) => m.WorkEditorialHeader));
export const WorkMarqueeHeader = dynamic(() => import('./WorkMarqueeHeader').then((m) => m.WorkMarqueeHeader));
export const WorkIndexHeader = dynamic(() => import('./WorkIndexHeader').then((m) => m.WorkIndexHeader));
export const WorkAccentCountHeader = dynamic(() => import('./WorkAccentCountHeader').then((m) => m.WorkAccentCountHeader));
export const WorkSerifLeadHeader = dynamic(() => import('./WorkSerifLeadHeader').then((m) => m.WorkSerifLeadHeader));
export const WorkBillboardHeader = dynamic(() => import('./WorkBillboardHeader').then((m) => m.WorkBillboardHeader));
export const WorkMastheadHeader = dynamic(() => import('./WorkMastheadHeader').then((m) => m.WorkMastheadHeader));
export const WorkSplitHeadingHeader = dynamic(() => import('./WorkSplitHeadingHeader').then((m) => m.WorkSplitHeadingHeader));
