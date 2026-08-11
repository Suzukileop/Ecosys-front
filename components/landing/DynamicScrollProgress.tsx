'use client';

import dynamic from 'next/dynamic';

const ScrollProgress = dynamic(() => import('@/components/landing/ScrollProgress'), {
  ssr: false,
});

export { ScrollProgress };
