'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const StackHeaderEditorialHeader = dynamic(() => import('./StackHeaderEditorialHeader').then((m) => m.StackHeaderEditorialHeader));
export const StackHeaderMarqueeHeader = dynamic(() => import('./StackHeaderMarqueeHeader').then((m) => m.StackHeaderMarqueeHeader));
export const StackHeaderIndexHeader = dynamic(() => import('./StackHeaderIndexHeader').then((m) => m.StackHeaderIndexHeader));
export const StackHeaderAccentCountHeader = dynamic(() => import('./StackHeaderAccentCountHeader').then((m) => m.StackHeaderAccentCountHeader));
export const StackHeaderSerifLeadHeader = dynamic(() => import('./StackHeaderSerifLeadHeader').then((m) => m.StackHeaderSerifLeadHeader));
export const StackHeaderBillboardHeader = dynamic(() => import('./StackHeaderBillboardHeader').then((m) => m.StackHeaderBillboardHeader));
export const StackHeaderMastheadHeader = dynamic(() => import('./StackHeaderMastheadHeader').then((m) => m.StackHeaderMastheadHeader));
export const StackHeaderSplitHeadingHeader = dynamic(() => import('./StackHeaderSplitHeadingHeader').then((m) => m.StackHeaderSplitHeadingHeader));
