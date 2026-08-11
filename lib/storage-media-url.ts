/** URLs médias stockés (local /api/storage ou R2) — chemins absolus pour le navigateur. */
export function resolveStorageMediaUrl(url: string | null | undefined): string {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

/** Nom de fichier suggéré à partir de l’URL ou du titre. */
export function suggestMediaFilename(url: string, title: string, fallbackExt = '.bin'): string {
  try {
    const segment = new URL(url).pathname.split('/').pop();
    if (segment && segment.includes('.')) {
      return decodeURIComponent(segment);
    }
  } catch {
    /* ignore */
  }
  const safe = title.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_').slice(0, 80) || 'content';
  return `${safe}${fallbackExt.startsWith('.') ? fallbackExt : `.${fallbackExt}`}`;
}

/** Télécharge un média (blob si possible, sinon lien direct). */
export async function downloadStorageMedia(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
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
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}
