'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const FooterHeaderEditorialHeader = dynamic(() => import('./FooterHeaderEditorialHeader').then((m) => m.FooterHeaderEditorialHeader));
export const FooterHeaderIndexHeader = dynamic(() => import('./FooterHeaderIndexHeader').then((m) => m.FooterHeaderIndexHeader));
export const FooterHeaderSerifLeadHeader = dynamic(() => import('./FooterHeaderSerifLeadHeader').then((m) => m.FooterHeaderSerifLeadHeader));
export const FooterHeaderBillboardHeader = dynamic(() => import('./FooterHeaderBillboardHeader').then((m) => m.FooterHeaderBillboardHeader));
export const FooterHeaderMastheadHeader = dynamic(() => import('./FooterHeaderMastheadHeader').then((m) => m.FooterHeaderMastheadHeader));
export const FooterHeaderHeroHeader = dynamic(() => import('./FooterHeaderHeroHeader').then((m) => m.FooterHeaderHeroHeader));
export const FooterHeaderNameHeader = dynamic(() => import('./FooterHeaderNameHeader').then((m) => m.FooterHeaderNameHeader));
export const FooterHeaderTimezoneHeader = dynamic(() => import('./FooterHeaderTimezoneHeader').then((m) => m.FooterHeaderTimezoneHeader));
