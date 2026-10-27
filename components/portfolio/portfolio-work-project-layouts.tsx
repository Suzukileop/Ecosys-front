'use client';

import dynamic from 'next/dynamic';
import { createElement, type ComponentType } from 'react';
import contentStyles from './portfolio-work-content.module.css';

function withWorkTypography<P extends object>(Gallery:ComponentType<P>) {
  return function WorkTypography(props:P) {
    return <div className={contentStyles.content}>{createElement(Gallery,props)}</div>;
  };
}

/**
 * A portfolio renders exactly one Projects layout, so each one is its own chunk: visitors
 * download the layout the creator picked instead of all fourteen.
 */
export const ProjectsBoardGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-board').then((m) => m.ProjectsBoardGallery)
));
export const ProjectsAccordionGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-accordion').then((m) => m.ProjectsAccordionGallery)
));
export const ProjectsFramesGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-frames').then((m) => m.ProjectsFramesGallery)
));
export const ProjectsIndexGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-index').then((m) => m.ProjectsIndexGallery)
));
export const ProjectsGridSection = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-grid').then((m) => m.ProjectsGridSection)
));
export const ProjectsSplitGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-split').then((m) => m.ProjectsSplitGallery)
));
export const ProjectsCarouselSection = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-carousel').then((m) => m.ProjectsCarouselSection)
));
export const ProjectsShowcaseGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-showcase').then((m) => m.ProjectsShowcaseGallery)
));
export const ProjectsLedgerGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-ledger').then((m) => m.ProjectsLedgerGallery)
));
export const ProjectsSpecGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-spec').then((m) => m.ProjectsSpecGallery)
));
export const ProjectsCaseGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-case').then((m) => m.ProjectsCaseGallery)
));
export const ProjectsPressGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-press').then((m) => m.ProjectsPressGallery)
));
export const ProjectsDuotoneGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-duotone').then((m) => m.ProjectsDuotoneGallery)
));
export const ProjectsCascadeGallery = withWorkTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-cascade').then((m) => m.ProjectsCascadeGallery)
));
