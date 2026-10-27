'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const StackHeaderEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./StackHeaderEditorialHeader').then((m) => m.StackHeaderEditorialHeader)));
export const StackHeaderMarqueeHeader = withSectionHeaderTypography(dynamic(() => import('./StackHeaderMarqueeHeader').then((m) => m.StackHeaderMarqueeHeader)));
export const StackHeaderIndexHeader = withSectionHeaderTypography(dynamic(() => import('./StackHeaderIndexHeader').then((m) => m.StackHeaderIndexHeader)));
export const StackHeaderAccentCountHeader = withSectionHeaderTypography(dynamic(() => import('./StackHeaderAccentCountHeader').then((m) => m.StackHeaderAccentCountHeader)));
export const StackHeaderSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./StackHeaderSerifLeadHeader').then((m) => m.StackHeaderSerifLeadHeader)));
export const StackHeaderBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./StackHeaderBillboardHeader').then((m) => m.StackHeaderBillboardHeader)));
export const StackHeaderMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./StackHeaderMastheadHeader').then((m) => m.StackHeaderMastheadHeader)));
export const StackHeaderSplitHeadingHeader = withSectionHeaderTypography(dynamic(() => import('./StackHeaderSplitHeadingHeader').then((m) => m.StackHeaderSplitHeadingHeader)));
