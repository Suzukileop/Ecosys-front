'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const GalleryHeaderEditorialHeader = dynamic(() => import('./GalleryHeaderEditorialHeader').then((m) => m.GalleryHeaderEditorialHeader));
export const GalleryHeaderMarqueeHeader = dynamic(() => import('./GalleryHeaderMarqueeHeader').then((m) => m.GalleryHeaderMarqueeHeader));
export const GalleryHeaderIndexHeader = dynamic(() => import('./GalleryHeaderIndexHeader').then((m) => m.GalleryHeaderIndexHeader));
export const GalleryHeaderAccentCountHeader = dynamic(() => import('./GalleryHeaderAccentCountHeader').then((m) => m.GalleryHeaderAccentCountHeader));
export const GalleryHeaderSerifLeadHeader = dynamic(() => import('./GalleryHeaderSerifLeadHeader').then((m) => m.GalleryHeaderSerifLeadHeader));
export const GalleryHeaderBillboardHeader = dynamic(() => import('./GalleryHeaderBillboardHeader').then((m) => m.GalleryHeaderBillboardHeader));
export const GalleryHeaderMastheadHeader = dynamic(() => import('./GalleryHeaderMastheadHeader').then((m) => m.GalleryHeaderMastheadHeader));
export const GalleryHeaderSplitHeadingHeader = dynamic(() => import('./GalleryHeaderSplitHeadingHeader').then((m) => m.GalleryHeaderSplitHeadingHeader));
