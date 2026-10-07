'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const InfoHeaderEditorialHeader = dynamic(() => import('./InfoHeaderEditorialHeader').then((m) => m.InfoHeaderEditorialHeader));
export const InfoHeaderMarqueeHeader = dynamic(() => import('./InfoHeaderMarqueeHeader').then((m) => m.InfoHeaderMarqueeHeader));
export const InfoHeaderIndexHeader = dynamic(() => import('./InfoHeaderIndexHeader').then((m) => m.InfoHeaderIndexHeader));
export const InfoHeaderAccentCountHeader = dynamic(() => import('./InfoHeaderAccentCountHeader').then((m) => m.InfoHeaderAccentCountHeader));
export const InfoHeaderSerifLeadHeader = dynamic(() => import('./InfoHeaderSerifLeadHeader').then((m) => m.InfoHeaderSerifLeadHeader));
export const InfoHeaderBillboardHeader = dynamic(() => import('./InfoHeaderBillboardHeader').then((m) => m.InfoHeaderBillboardHeader));
export const InfoHeaderMastheadHeader = dynamic(() => import('./InfoHeaderMastheadHeader').then((m) => m.InfoHeaderMastheadHeader));
export const InfoHeaderSplitHeadingHeader = dynamic(() => import('./InfoHeaderSplitHeadingHeader').then((m) => m.InfoHeaderSplitHeadingHeader));
export const InfoHeaderChapterHeader = dynamic(() => import('./InfoHeaderChapterHeader').then((m) => m.InfoHeaderChapterHeader));
export const InfoHeaderCoverHeader = dynamic(() => import('./InfoHeaderCoverHeader').then((m) => m.InfoHeaderCoverHeader));
