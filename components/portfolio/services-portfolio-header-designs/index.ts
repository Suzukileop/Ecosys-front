'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const ServicesHeaderEditorialHeader = dynamic(() => import('./ServicesHeaderEditorialHeader').then((m) => m.ServicesHeaderEditorialHeader));
export const ServicesHeaderMarqueeHeader = dynamic(() => import('./ServicesHeaderMarqueeHeader').then((m) => m.ServicesHeaderMarqueeHeader));
export const ServicesHeaderIndexHeader = dynamic(() => import('./ServicesHeaderIndexHeader').then((m) => m.ServicesHeaderIndexHeader));
export const ServicesHeaderAccentCountHeader = dynamic(() => import('./ServicesHeaderAccentCountHeader').then((m) => m.ServicesHeaderAccentCountHeader));
export const ServicesHeaderSerifLeadHeader = dynamic(() => import('./ServicesHeaderSerifLeadHeader').then((m) => m.ServicesHeaderSerifLeadHeader));
export const ServicesHeaderBillboardHeader = dynamic(() => import('./ServicesHeaderBillboardHeader').then((m) => m.ServicesHeaderBillboardHeader));
export const ServicesHeaderMastheadHeader = dynamic(() => import('./ServicesHeaderMastheadHeader').then((m) => m.ServicesHeaderMastheadHeader));
export const ServicesHeaderSplitHeadingHeader = dynamic(() => import('./ServicesHeaderSplitHeadingHeader').then((m) => m.ServicesHeaderSplitHeadingHeader));
