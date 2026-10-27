'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const ServicesHeaderEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./ServicesHeaderEditorialHeader').then((m) => m.ServicesHeaderEditorialHeader)));
export const ServicesHeaderMarqueeHeader = withSectionHeaderTypography(dynamic(() => import('./ServicesHeaderMarqueeHeader').then((m) => m.ServicesHeaderMarqueeHeader)));
export const ServicesHeaderIndexHeader = withSectionHeaderTypography(dynamic(() => import('./ServicesHeaderIndexHeader').then((m) => m.ServicesHeaderIndexHeader)));
export const ServicesHeaderAccentCountHeader = withSectionHeaderTypography(dynamic(() => import('./ServicesHeaderAccentCountHeader').then((m) => m.ServicesHeaderAccentCountHeader)));
export const ServicesHeaderSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./ServicesHeaderSerifLeadHeader').then((m) => m.ServicesHeaderSerifLeadHeader)));
export const ServicesHeaderBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./ServicesHeaderBillboardHeader').then((m) => m.ServicesHeaderBillboardHeader)));
export const ServicesHeaderMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./ServicesHeaderMastheadHeader').then((m) => m.ServicesHeaderMastheadHeader)));
export const ServicesHeaderSplitHeadingHeader = withSectionHeaderTypography(dynamic(() => import('./ServicesHeaderSplitHeadingHeader').then((m) => m.ServicesHeaderSplitHeadingHeader)));
