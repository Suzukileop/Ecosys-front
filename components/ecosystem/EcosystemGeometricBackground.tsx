'use client';

import dynamic from 'next/dynamic';

const GeometricPatternBackgroundClient = dynamic(
  () =>
    import('@/components/ui/GeometricPatternBackground').then((mod) => ({
      default: mod.GeometricPatternBackground,
    })),
  { ssr: false }
);

/** Fond géométrique — chargé côté client uniquement (évite les erreurs SSR / HMR). */
export function EcosystemGeometricBackground() {
  return <GeometricPatternBackgroundClient />;
}
