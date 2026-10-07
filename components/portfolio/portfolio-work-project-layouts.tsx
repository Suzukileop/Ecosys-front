'use client';

import dynamic from 'next/dynamic';

/**
 * A portfolio renders exactly one Projects layout, so each one is its own chunk: visitors
 * download the layout the creator picked instead of all fourteen.
 */
export const ProjectsBoardGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-board').then((m) => m.ProjectsBoardGallery)
);
export const ProjectsAccordionGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-accordion').then((m) => m.ProjectsAccordionGallery)
);
export const ProjectsFramesGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-frames').then((m) => m.ProjectsFramesGallery)
);
export const ProjectsIndexGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-index').then((m) => m.ProjectsIndexGallery)
);
export const ProjectsGridSection = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-grid').then((m) => m.ProjectsGridSection)
);
export const ProjectsSplitGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-split').then((m) => m.ProjectsSplitGallery)
);
export const ProjectsCarouselSection = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-carousel').then((m) => m.ProjectsCarouselSection)
);
export const ProjectsShowcaseGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-showcase').then((m) => m.ProjectsShowcaseGallery)
);
export const ProjectsLedgerGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-ledger').then((m) => m.ProjectsLedgerGallery)
);
export const ProjectsSpecGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-spec').then((m) => m.ProjectsSpecGallery)
);
export const ProjectsCaseGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-case').then((m) => m.ProjectsCaseGallery)
);
export const ProjectsPressGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-press').then((m) => m.ProjectsPressGallery)
);
export const ProjectsDuotoneGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-duotone').then((m) => m.ProjectsDuotoneGallery)
);
export const ProjectsCascadeGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-work-projects-cascade').then((m) => m.ProjectsCascadeGallery)
);
