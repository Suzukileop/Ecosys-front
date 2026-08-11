import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/** Import dynamique fiable pour exports nommés (évite ChunkLoadError /_next/undefined). */
export function dynamicNamed<P extends object>(
  loader: () => Promise<Record<string, ComponentType<P>>>,
  exportName: string
) {
  return dynamic(() =>
    loader().then((mod) => ({ default: mod[exportName] as ComponentType<P> }))
  );
}
