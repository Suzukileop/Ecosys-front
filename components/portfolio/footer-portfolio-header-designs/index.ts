'use client';

import dynamic from 'next/dynamic';
import { withSectionHeaderTypography } from '../portfolio-section-header-typography';

/** A section renders one header design, so each is its own chunk. */
export const FooterHeaderEditorialHeader = withSectionHeaderTypography(dynamic(() => import('./FooterHeaderEditorialHeader').then((m) => m.FooterHeaderEditorialHeader)));
export const FooterHeaderIndexHeader = withSectionHeaderTypography(dynamic(() => import('./FooterHeaderIndexHeader').then((m) => m.FooterHeaderIndexHeader)));
export const FooterHeaderSerifLeadHeader = withSectionHeaderTypography(dynamic(() => import('./FooterHeaderSerifLeadHeader').then((m) => m.FooterHeaderSerifLeadHeader)));
export const FooterHeaderBillboardHeader = withSectionHeaderTypography(dynamic(() => import('./FooterHeaderBillboardHeader').then((m) => m.FooterHeaderBillboardHeader)));
export const FooterHeaderMastheadHeader = withSectionHeaderTypography(dynamic(() => import('./FooterHeaderMastheadHeader').then((m) => m.FooterHeaderMastheadHeader)));
export const FooterHeaderHeroHeader = withSectionHeaderTypography(dynamic(() => import('./FooterHeaderHeroHeader').then((m) => m.FooterHeaderHeroHeader)));
export const FooterHeaderNameHeader = withSectionHeaderTypography(dynamic(() => import('./FooterHeaderNameHeader').then((m) => m.FooterHeaderNameHeader)));
export const FooterHeaderTimezoneHeader = withSectionHeaderTypography(dynamic(() => import('./FooterHeaderTimezoneHeader').then((m) => m.FooterHeaderTimezoneHeader)));
