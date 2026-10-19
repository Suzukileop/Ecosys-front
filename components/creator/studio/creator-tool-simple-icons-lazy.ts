import { useEffect, useSyncExternalStore } from 'react';

/*
 * The Simple Icons table (~100 brand SVGs, ~72 KB gzipped) is the third logo source, after an
 * uploaded logo and the bundled TechIcons PNGs, and the fallback brand colour of level bars — yet
 * every public portfolio downloaded it up front. It is now fetched the first time a rendered tool
 * needs it. The server render and hydration always see "not loaded" (letter / label colour), so
 * the two never disagree; marks and bar colours update right after hydration.
 */
type SimpleIconsModule = typeof import('@/components/creator/studio/creator-tool-simple-icons');

let loaded: SimpleIconsModule | null = null;
let pending: Promise<SimpleIconsModule> | null = null;
const listeners = new Set<() => void>();

export function loadCreatorToolSimpleIcons(): Promise<SimpleIconsModule> {
  pending ??= import('@/components/creator/studio/creator-tool-simple-icons').then((mod) => {
    loaded = mod;
    listeners.forEach((listener) => listener());
    return mod;
  });
  return pending;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => loaded;
const getServerSnapshot = () => null;

/** The icon table once loaded; `needed` false never triggers the download. */
export function useCreatorToolSimpleIcons(needed: boolean): SimpleIconsModule | null {
  const mod = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    if (needed && !loaded) void loadCreatorToolSimpleIcons();
  }, [needed]);
  return mod;
}
