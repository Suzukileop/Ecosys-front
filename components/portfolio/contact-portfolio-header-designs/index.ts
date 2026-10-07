'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const ContactHeaderEditorialHeader = dynamic(() => import('./ContactHeaderEditorialHeader').then((m) => m.ContactHeaderEditorialHeader));
export const ContactHeaderMarqueeHeader = dynamic(() => import('./ContactHeaderMarqueeHeader').then((m) => m.ContactHeaderMarqueeHeader));
export const ContactHeaderIndexHeader = dynamic(() => import('./ContactHeaderIndexHeader').then((m) => m.ContactHeaderIndexHeader));
export const ContactHeaderAccentCountHeader = dynamic(() => import('./ContactHeaderAccentCountHeader').then((m) => m.ContactHeaderAccentCountHeader));
export const ContactHeaderSerifLeadHeader = dynamic(() => import('./ContactHeaderSerifLeadHeader').then((m) => m.ContactHeaderSerifLeadHeader));
export const ContactHeaderBillboardHeader = dynamic(() => import('./ContactHeaderBillboardHeader').then((m) => m.ContactHeaderBillboardHeader));
export const ContactHeaderMastheadHeader = dynamic(() => import('./ContactHeaderMastheadHeader').then((m) => m.ContactHeaderMastheadHeader));
export const ContactHeaderSplitHeadingHeader = dynamic(() => import('./ContactHeaderSplitHeadingHeader').then((m) => m.ContactHeaderSplitHeadingHeader));
