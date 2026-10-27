'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const FaqHeaderEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderEditorialHeader').then((m) => m.FaqHeaderEditorialHeader)));
export const FaqHeaderMarqueeHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderMarqueeHeader').then((m) => m.FaqHeaderMarqueeHeader)));
export const FaqHeaderIndexHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderIndexHeader').then((m) => m.FaqHeaderIndexHeader)));
export const FaqHeaderAccentCountHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderAccentCountHeader').then((m) => m.FaqHeaderAccentCountHeader)));
export const FaqHeaderSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderSerifLeadHeader').then((m) => m.FaqHeaderSerifLeadHeader)));
export const FaqHeaderBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderBillboardHeader').then((m) => m.FaqHeaderBillboardHeader)));
export const FaqHeaderMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderMastheadHeader').then((m) => m.FaqHeaderMastheadHeader)));
export const FaqHeaderSplitHeadingHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderSplitHeadingHeader').then((m) => m.FaqHeaderSplitHeadingHeader)));
export const FaqHeaderSignalHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderSignalHeader').then((m) => m.FaqHeaderSignalHeader)));
export const FaqHeaderQueryHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderQueryHeader').then((m) => m.FaqHeaderQueryHeader)));
export const FaqHeaderDialogueHeader = withSectionHeaderTypography(dynamic(() => import('./FaqHeaderDialogueHeader').then((m) => m.FaqHeaderDialogueHeader)));
