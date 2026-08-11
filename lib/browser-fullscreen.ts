export async function enterBrowserFullscreen(target?: HTMLElement | null): Promise<void> {
  const el = target ?? document.documentElement;
  if (!el.requestFullscreen) return;
  if (document.fullscreenElement) return;
  await el.requestFullscreen();
}

export async function exitBrowserFullscreen(): Promise<void> {
  if (!document.fullscreenElement) return;
  await document.exitFullscreen();
}
