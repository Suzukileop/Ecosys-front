type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export function getBrowserFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export async function enterBrowserFullscreen(target?: HTMLElement | null): Promise<void> {
  const el = (target ?? document.documentElement) as FullscreenElement;
  if (getBrowserFullscreenElement() === el) return;
  if (getBrowserFullscreenElement()) return;
  const request = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
  if (!request) return;
  await request();
}

export async function exitBrowserFullscreen(): Promise<void> {
  if (!getBrowserFullscreenElement()) return;
  const doc = document as FullscreenDocument;
  const exit = doc.exitFullscreen?.bind(doc) ?? doc.webkitExitFullscreen?.bind(doc);
  if (!exit) return;
  await exit();
}
