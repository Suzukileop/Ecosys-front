'use client';

import dynamic from 'next/dynamic';
import { createElement, type ComponentType } from 'react';
import styles from './info-header-content.module.css';

function withInfoHeaderTypography<P extends object>(Header:ComponentType<P>) {
  return function InfoHeaderTypography(props:P) {
    return createElement('div',{className:styles.header},createElement(Header,props));
  };
}

/** A section renders one header design, so each is its own chunk. */
export const InfoHeaderEditorialHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderEditorialHeader').then((m) => m.InfoHeaderEditorialHeader)));
export const InfoHeaderMarqueeHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderMarqueeHeader').then((m) => m.InfoHeaderMarqueeHeader)));
export const InfoHeaderIndexHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderIndexHeader').then((m) => m.InfoHeaderIndexHeader)));
export const InfoHeaderAccentCountHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderAccentCountHeader').then((m) => m.InfoHeaderAccentCountHeader)));
export const InfoHeaderSerifLeadHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderSerifLeadHeader').then((m) => m.InfoHeaderSerifLeadHeader)));
export const InfoHeaderBillboardHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderBillboardHeader').then((m) => m.InfoHeaderBillboardHeader)));
export const InfoHeaderMastheadHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderMastheadHeader').then((m) => m.InfoHeaderMastheadHeader)));
export const InfoHeaderSplitHeadingHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderSplitHeadingHeader').then((m) => m.InfoHeaderSplitHeadingHeader)));
export const InfoHeaderChapterHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderChapterHeader').then((m) => m.InfoHeaderChapterHeader)));
export const InfoHeaderCoverHeader = withInfoHeaderTypography(dynamic(() => import('./InfoHeaderCoverHeader').then((m) => m.InfoHeaderCoverHeader)));
