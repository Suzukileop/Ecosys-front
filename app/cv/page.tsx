/* Families portfolios can pick by name — not needed on the landing / sign-in pages. */
import '@/lib/fonts/portfolio-fonts';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CvGeneratorPage } from '@/components/portfolio/cv/CvGeneratorPage';
import { msg } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: msg('CV — Skraft'),
  robots: { index: false, follow: false },
};

export default function CvPage() {
  return (
    <Suspense fallback={null}>
      <CvGeneratorPage />
    </Suspense>
  );
}
