'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const TeamHeaderEditorialHeader = dynamic(() => import('./TeamHeaderEditorialHeader').then((m) => m.TeamHeaderEditorialHeader));
export const TeamHeaderMarqueeHeader = dynamic(() => import('./TeamHeaderMarqueeHeader').then((m) => m.TeamHeaderMarqueeHeader));
export const TeamHeaderIndexHeader = dynamic(() => import('./TeamHeaderIndexHeader').then((m) => m.TeamHeaderIndexHeader));
export const TeamHeaderAccentCountHeader = dynamic(() => import('./TeamHeaderAccentCountHeader').then((m) => m.TeamHeaderAccentCountHeader));
export const TeamHeaderSerifLeadHeader = dynamic(() => import('./TeamHeaderSerifLeadHeader').then((m) => m.TeamHeaderSerifLeadHeader));
export const TeamHeaderBillboardHeader = dynamic(() => import('./TeamHeaderBillboardHeader').then((m) => m.TeamHeaderBillboardHeader));
export const TeamHeaderMastheadHeader = dynamic(() => import('./TeamHeaderMastheadHeader').then((m) => m.TeamHeaderMastheadHeader));
export const TeamHeaderSplitHeadingHeader = dynamic(() => import('./TeamHeaderSplitHeadingHeader').then((m) => m.TeamHeaderSplitHeadingHeader));
