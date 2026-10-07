'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const FaqHeaderEditorialHeader = dynamic(() => import('./FaqHeaderEditorialHeader').then((m) => m.FaqHeaderEditorialHeader));
export const FaqHeaderMarqueeHeader = dynamic(() => import('./FaqHeaderMarqueeHeader').then((m) => m.FaqHeaderMarqueeHeader));
export const FaqHeaderIndexHeader = dynamic(() => import('./FaqHeaderIndexHeader').then((m) => m.FaqHeaderIndexHeader));
export const FaqHeaderAccentCountHeader = dynamic(() => import('./FaqHeaderAccentCountHeader').then((m) => m.FaqHeaderAccentCountHeader));
export const FaqHeaderSerifLeadHeader = dynamic(() => import('./FaqHeaderSerifLeadHeader').then((m) => m.FaqHeaderSerifLeadHeader));
export const FaqHeaderBillboardHeader = dynamic(() => import('./FaqHeaderBillboardHeader').then((m) => m.FaqHeaderBillboardHeader));
export const FaqHeaderMastheadHeader = dynamic(() => import('./FaqHeaderMastheadHeader').then((m) => m.FaqHeaderMastheadHeader));
export const FaqHeaderSplitHeadingHeader = dynamic(() => import('./FaqHeaderSplitHeadingHeader').then((m) => m.FaqHeaderSplitHeadingHeader));
export const FaqHeaderSignalHeader = dynamic(() => import('./FaqHeaderSignalHeader').then((m) => m.FaqHeaderSignalHeader));
export const FaqHeaderQueryHeader = dynamic(() => import('./FaqHeaderQueryHeader').then((m) => m.FaqHeaderQueryHeader));
export const FaqHeaderDialogueHeader = dynamic(() => import('./FaqHeaderDialogueHeader').then((m) => m.FaqHeaderDialogueHeader));
