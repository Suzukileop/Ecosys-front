/** Session-only rendered previews. Never persist account content in browser storage. */
export type PortfolioPreviewSnapshot = {
  src: string;
  settingsKey: string;
  html: string;
  height: number;
  expiresAt: number;
};

const MAX_ENTRIES = 24;
const MAX_BYTES = 8 * 1024 * 1024;
const TTL_MS = 5 * 60 * 1000;
const snapshots = new Map<string, PortfolioPreviewSnapshot>();
let bytes = 0;
const sizeOf = (entry: PortfolioPreviewSnapshot) => (entry.html.length + entry.settingsKey.length) * 2;

function remove(src: string) {
  const previous = snapshots.get(src);
  if (previous) bytes -= sizeOf(previous);
  snapshots.delete(src);
}

export function readPortfolioPreview(src: string, settingsKey: string): PortfolioPreviewSnapshot | null {
  const entry = snapshots.get(src);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    remove(src);
    return null;
  }
  if (entry.settingsKey !== settingsKey) return null;
  snapshots.delete(src);
  snapshots.set(src, entry);
  return entry;
}

export function storePortfolioPreview(src: string, settingsKey: string, html: string, height: number) {
  if (!html || !Number.isFinite(height) || height <= 0) return;
  const entry = { src, settingsKey, html, height, expiresAt: Date.now() + TTL_MS };
  if (sizeOf(entry) > MAX_BYTES) return;
  remove(src);
  snapshots.set(src, entry);
  bytes += sizeOf(entry);
  while (snapshots.size > MAX_ENTRIES || bytes > MAX_BYTES) remove(snapshots.keys().next().value!);
}

/** A script-free copy restores the actual rendered layout without fetching/hydrating the portfolio. */
export function capturePortfolioPreview(frame: HTMLIFrameElement, src: string, settingsKey: string) {
  try {
    const doc = frame.contentDocument;
    const root = doc?.querySelector<HTMLElement>('[data-design-preview-root]');
    if (!doc || !root || !root.textContent?.trim() || root.querySelector('canvas, iframe, video')) return;
    const height = Math.ceil(root.getBoundingClientRect().height);
    const copy = doc.documentElement.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('script, nextjs-portal, meta[http-equiv="refresh"], link[rel="modulepreload"], link[rel="prefetch"], link[rel="preload"][as="script"]').forEach(node => node.remove());
    // Resolve relative styles/images against the original page, not the srcdoc URL.
    const head = copy.querySelector('head');
    if (!head) return;
    copy.querySelectorAll('base').forEach(node => node.remove());
    const base = doc.createElement('base');
    base.href = doc.baseURI;
    head.prepend(base);
    storePortfolioPreview(src, settingsKey, '<!doctype html>' + copy.outerHTML, height);
  } catch {
    // Cross-origin assets or a navigating frame must never break the live preview fallback.
  }
}
