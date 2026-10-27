'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const ExperienceHeaderEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./ExperienceHeaderEditorialHeader').then((m) => m.ExperienceHeaderEditorialHeader)));
export const ExperienceHeaderMarqueeHeader = withSectionHeaderTypography(dynamic(() => import('./ExperienceHeaderMarqueeHeader').then((m) => m.ExperienceHeaderMarqueeHeader)));
export const ExperienceHeaderIndexHeader = withSectionHeaderTypography(dynamic(() => import('./ExperienceHeaderIndexHeader').then((m) => m.ExperienceHeaderIndexHeader)));
export const ExperienceHeaderAccentCountHeader = withSectionHeaderTypography(dynamic(() => import('./ExperienceHeaderAccentCountHeader').then((m) => m.ExperienceHeaderAccentCountHeader)));
export const ExperienceHeaderSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./ExperienceHeaderSerifLeadHeader').then((m) => m.ExperienceHeaderSerifLeadHeader)));
export const ExperienceHeaderBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./ExperienceHeaderBillboardHeader').then((m) => m.ExperienceHeaderBillboardHeader)));
export const ExperienceHeaderMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./ExperienceHeaderMastheadHeader').then((m) => m.ExperienceHeaderMastheadHeader)));
export const ExperienceHeaderSplitHeadingHeader = withSectionHeaderTypography(dynamic(() => import('./ExperienceHeaderSplitHeadingHeader').then((m) => m.ExperienceHeaderSplitHeadingHeader)));
