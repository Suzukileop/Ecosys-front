/** Opens a signed URL so the browser saves the file instead of navigating away or playing inline. */
export function triggerBrowserDownload(url: string, filename?: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.style.display = 'none';
  anchor.rel = 'noopener noreferrer';
  if (filename) {
    anchor.download = filename;
  }
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function downloadFromUrl(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function extensionFromUrl(url: string, fallback: string): string {
  try {
    const pathname = new URL(url).pathname;
    const dot = pathname.lastIndexOf('.');
    if (dot >= 0 && dot < pathname.length - 1) {
      return pathname.slice(dot + 1).split('?')[0] || fallback;
    }
  } catch {
    // ignore
  }
  return fallback;
}
