import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CvGeneratorPage } from '@/components/portfolio/cv/CvGeneratorPage';

export const metadata: Metadata = {
  title: 'CV — Skraft',
  robots: { index: false, follow: false },
};

export default function CvPage() {
  return (
    <Suspense fallback={null}>
      <CvGeneratorPage />
    </Suspense>
  );
}
