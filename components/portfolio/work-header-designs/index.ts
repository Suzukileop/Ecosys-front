'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const WorkEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./WorkEditorialHeader').then((m) => m.WorkEditorialHeader)));
export const WorkMarqueeHeader = withSectionHeaderTypography(dynamic(() => import('./WorkMarqueeHeader').then((m) => m.WorkMarqueeHeader)));
export const WorkIndexHeader = withSectionHeaderTypography(dynamic(() => import('./WorkIndexHeader').then((m) => m.WorkIndexHeader)));
export const WorkAccentCountHeader = withSectionHeaderTypography(dynamic(() => import('./WorkAccentCountHeader').then((m) => m.WorkAccentCountHeader)));
export const WorkSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./WorkSerifLeadHeader').then((m) => m.WorkSerifLeadHeader)));
export const WorkBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./WorkBillboardHeader').then((m) => m.WorkBillboardHeader)));
export const WorkMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./WorkMastheadHeader').then((m) => m.WorkMastheadHeader)));
export const WorkSplitHeadingHeader = withSectionHeaderTypography(dynamic(() => import('./WorkSplitHeadingHeader').then((m) => m.WorkSplitHeadingHeader)));
