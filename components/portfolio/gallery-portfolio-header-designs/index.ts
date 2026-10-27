'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const GalleryHeaderEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./GalleryHeaderEditorialHeader').then((m) => m.GalleryHeaderEditorialHeader)));
export const GalleryHeaderMarqueeHeader = withSectionHeaderTypography(dynamic(() => import('./GalleryHeaderMarqueeHeader').then((m) => m.GalleryHeaderMarqueeHeader)));
export const GalleryHeaderIndexHeader = withSectionHeaderTypography(dynamic(() => import('./GalleryHeaderIndexHeader').then((m) => m.GalleryHeaderIndexHeader)));
export const GalleryHeaderAccentCountHeader = withSectionHeaderTypography(dynamic(() => import('./GalleryHeaderAccentCountHeader').then((m) => m.GalleryHeaderAccentCountHeader)));
export const GalleryHeaderSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./GalleryHeaderSerifLeadHeader').then((m) => m.GalleryHeaderSerifLeadHeader)));
export const GalleryHeaderBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./GalleryHeaderBillboardHeader').then((m) => m.GalleryHeaderBillboardHeader)));
export const GalleryHeaderMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./GalleryHeaderMastheadHeader').then((m) => m.GalleryHeaderMastheadHeader)));
export const GalleryHeaderSplitHeadingHeader = withSectionHeaderTypography(dynamic(() => import('./GalleryHeaderSplitHeadingHeader').then((m) => m.GalleryHeaderSplitHeadingHeader)));
