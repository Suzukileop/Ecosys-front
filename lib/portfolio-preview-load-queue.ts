/** Share startup capacity across all catalogues; mounted previews retain their loaded document. */
const MAX_LOADING = 3;
type Entry = { start: (release: () => void) => void; cancelled: boolean };
const pending: Entry[] = [];
let loading = 0;

function drain() {
  while (loading < MAX_LOADING && pending.length) {
    const entry = pending.shift()!;
    if (entry.cancelled) continue;
    loading++;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      clearTimeout(timeout);
      loading--;
      drain();
    };
    // A failed page must not prevent every later card from loading.
    const timeout = setTimeout(release, 30000);
    entry.start(release);
  }
}

export function enqueuePortfolioPreview(start: (release: () => void) => void): () => void {
  let releaseActive: (() => void) | undefined;
  const entry: Entry = {
    cancelled: false,
    start: release => {
      releaseActive = release;
      start(release);
    },
  };
  pending.push(entry);
  drain();
  return () => {
    entry.cancelled = true;
    const index = pending.indexOf(entry);
    if (index >= 0) pending.splice(index, 1);
    releaseActive?.();
  };
}
