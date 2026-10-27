'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const ContactHeaderEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./ContactHeaderEditorialHeader').then((m) => m.ContactHeaderEditorialHeader)));
export const ContactHeaderMarqueeHeader = withSectionHeaderTypography(dynamic(() => import('./ContactHeaderMarqueeHeader').then((m) => m.ContactHeaderMarqueeHeader)));
export const ContactHeaderIndexHeader = withSectionHeaderTypography(dynamic(() => import('./ContactHeaderIndexHeader').then((m) => m.ContactHeaderIndexHeader)));
export const ContactHeaderAccentCountHeader = withSectionHeaderTypography(dynamic(() => import('./ContactHeaderAccentCountHeader').then((m) => m.ContactHeaderAccentCountHeader)));
export const ContactHeaderSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./ContactHeaderSerifLeadHeader').then((m) => m.ContactHeaderSerifLeadHeader)));
export const ContactHeaderBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./ContactHeaderBillboardHeader').then((m) => m.ContactHeaderBillboardHeader)));
export const ContactHeaderMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./ContactHeaderMastheadHeader').then((m) => m.ContactHeaderMastheadHeader)));
export const ContactHeaderSplitHeadingHeader = withSectionHeaderTypography(dynamic(() => import('./ContactHeaderSplitHeadingHeader').then((m) => m.ContactHeaderSplitHeadingHeader)));
