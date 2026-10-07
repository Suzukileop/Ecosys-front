'use client';

import dynamic from 'next/dynamic';

/** A section renders one header design, so each is its own chunk. */
export const ExperienceTableHeader = dynamic(() => import('./ExperienceTableHeader').then((m) => m.ExperienceTableHeader));
export const ExperienceCardsHeader = dynamic(() => import('./ExperienceCardsHeader').then((m) => m.ExperienceCardsHeader));
export const ExperienceGalleryHeader = dynamic(() => import('./ExperienceGalleryHeader').then((m) => m.ExperienceGalleryHeader));
export const ExperienceSpotlightHeader = dynamic(() => import('./ExperienceSpotlightHeader').then((m) => m.ExperienceSpotlightHeader));
export const ExperienceLoftHeader = dynamic(() => import('./ExperienceLoftHeader').then((m) => m.ExperienceLoftHeader));
export const ExperiencePressHeader = dynamic(() => import('./ExperiencePressHeader').then((m) => m.ExperiencePressHeader));
export const ExperienceLegacyHeader = dynamic(() => import('./ExperienceLegacyHeader').then((m) => m.ExperienceLegacyHeader));
export const ExperienceReelHeader = dynamic(() => import('./ExperienceReelHeader').then((m) => m.ExperienceReelHeader));
export const ExperienceDuotoneHeader = dynamic(() => import('./ExperienceDuotoneHeader').then((m) => m.ExperienceDuotoneHeader));
