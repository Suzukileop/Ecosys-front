'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const TeamHeaderEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./TeamHeaderEditorialHeader').then((m) => m.TeamHeaderEditorialHeader)));
export const TeamHeaderMarqueeHeader = withSectionHeaderTypography(dynamic(() => import('./TeamHeaderMarqueeHeader').then((m) => m.TeamHeaderMarqueeHeader)));
export const TeamHeaderIndexHeader = withSectionHeaderTypography(dynamic(() => import('./TeamHeaderIndexHeader').then((m) => m.TeamHeaderIndexHeader)));
export const TeamHeaderAccentCountHeader = withSectionHeaderTypography(dynamic(() => import('./TeamHeaderAccentCountHeader').then((m) => m.TeamHeaderAccentCountHeader)));
export const TeamHeaderSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./TeamHeaderSerifLeadHeader').then((m) => m.TeamHeaderSerifLeadHeader)));
export const TeamHeaderBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./TeamHeaderBillboardHeader').then((m) => m.TeamHeaderBillboardHeader)));
export const TeamHeaderMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./TeamHeaderMastheadHeader').then((m) => m.TeamHeaderMastheadHeader)));
export const TeamHeaderSplitHeadingHeader = withSectionHeaderTypography(dynamic(() => import('./TeamHeaderSplitHeadingHeader').then((m) => m.TeamHeaderSplitHeadingHeader)));
