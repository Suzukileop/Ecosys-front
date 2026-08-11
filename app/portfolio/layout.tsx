import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PortfolioThemeLock } from '@/components/portfolio/PortfolioThemeLock';
import { FlashToastHost } from '@/components/ui/FlashToastHost';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

/** Standalone layout — no dashboard sidebar or marketplace chrome. Always light mode. */
export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortfolioThemeLock />
      <div className="min-h-screen bg-white text-neutral-900">{children}</div>
      <Suspense fallback={null}>
        <FlashToastHost />
      </Suspense>
    </>
  );
}
