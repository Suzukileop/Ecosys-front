import {
  mergePortfolioSettings,
  type PortfolioSettings,
} from '@/components/portfolio/portfolio-settings-types';
import type { PortfolioCustomTheme } from '@/components/portfolio/portfolio-custom-themes';

type PortfolioSettingsSections = Omit<PortfolioSettings, 'themeId' | 'customThemes' | 'updatedAt'>;
type PathSegment = string | number;

/** Give up after a few passes instead of oscillating on pathological documents. */
const MAX_CONVERGENCE_PASSES = 6;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Keys carrying a real value — `undefined` and a missing key are the same to JSON. */
function definedKeys(value: Record<string, unknown>): string[] {
  return Object.keys(value).filter((key) => value[key] !== undefined);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((entry, index) => deepEqual(entry, b[index]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = definedKeys(a);
    if (keys.length !== definedKeys(b).length) return false;
    return keys.every((key) => deepEqual(a[key], b[key]));
  }
  return false;
}

/**
 * Migration markers (`sidePanelSettingsRevision`, `mobileAlignSettingsRevision`, …) read as
 * revision 0 when absent, which replays the migration and overwrites deliberate values.
 * They must survive pruning even when they match the baseline.
 */
function isMigrationMarkerKey(key: string): boolean {
  return /Revision$/.test(key);
}

/**
 * Drop every entry that already matches the baseline document.
 * Returns `undefined` when nothing differs, so callers can omit the key.
 */
function pruneAgainstBaseline(value: unknown, baseline: unknown): unknown {
  if (isPlainObject(value) && isPlainObject(baseline)) {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (isMigrationMarkerKey(key)) {
        out[key] = entry;
        continue;
      }
      const pruned = pruneAgainstBaseline(entry, baseline[key]);
      if (pruned !== undefined) out[key] = pruned;
    }
    return definedKeys(out).length > 0 ? out : undefined;
  }
  return deepEqual(value, baseline) ? undefined : value;
}

function sectionsOf(settings: PortfolioSettings): PortfolioSettingsSections {
  const { themeId, customThemes, updatedAt, ...sections } = settings;
  void themeId;
  void customThemes;
  void updatedAt;
  return sections;
}

/**
 * What the read path rebuilds when a document carries no section keys at all.
 * This — not the raw defaults — is the baseline an omitted key resolves to,
 * because `mergePortfolioSettings` also replays palettes and legacy migrations.
 */
function baselineSections(
  themeId: PortfolioSettings['themeId'],
  customThemes: PortfolioCustomTheme[]
): PortfolioSettingsSections {
  return sectionsOf(mergePortfolioSettings({ themeId, customThemes }));
}

function collectDiffPaths(
  expected: unknown,
  actual: unknown,
  path: PathSegment[] = [],
  out: PathSegment[][] = []
): PathSegment[][] {
  if (isPlainObject(expected) && isPlainObject(actual)) {
    for (const key of new Set([...definedKeys(expected), ...definedKeys(actual)])) {
      collectDiffPaths(expected[key], actual[key], [...path, key], out);
    }
    return out;
  }
  if (Array.isArray(expected) && Array.isArray(actual) && expected.length === actual.length) {
    expected.forEach((item, index) => collectDiffPaths(item, actual[index], [...path, index], out));
    return out;
  }
  if (!deepEqual(expected, actual)) out.push(path);
  return out;
}

function readAtPath(root: unknown, path: PathSegment[]): unknown {
  return path.reduce<unknown>((node, segment) => {
    if (Array.isArray(node) && typeof segment === 'number') return node[segment];
    if (isPlainObject(node)) return node[String(segment)];
    return undefined;
  }, root);
}

function writeAtPath(root: unknown, path: PathSegment[], value: unknown): void {
  if (path.length === 0) return;
  let node: unknown = root;
  for (let i = 0; i < path.length - 1; i += 1) {
    const segment = path[i];
    if (Array.isArray(node) && typeof segment === 'number') {
      if (!isPlainObject(node[segment]) && !Array.isArray(node[segment])) node[segment] = {};
      node = node[segment];
      continue;
    }
    if (!isPlainObject(node)) return;
    const key = String(segment);
    if (!isPlainObject(node[key]) && !Array.isArray(node[key])) node[key] = {};
    node = node[key];
  }
  const last = path[path.length - 1];
  if (Array.isArray(node) && typeof last === 'number') {
    node[last] = value;
    return;
  }
  if (isPlainObject(node)) node[String(last)] = value;
}

function pruneCustomThemes(
  themes: PortfolioCustomTheme[],
  snapshotBaseline: PortfolioSettingsSections
): PortfolioCustomTheme[] {
  return themes.map((theme) => ({
    ...theme,
    snapshot: (pruneAgainstBaseline(theme.snapshot, snapshotBaseline) ??
      {}) as PortfolioCustomTheme['snapshot'],
  }));
}

/**
 * Shrink the persisted document to the values that actually differ from what the read
 * path rebuilds on its own. Custom themes are the main offender: each one embeds a full
 * copy of every section.
 *
 * A handful of values are derived from sibling keys (palettes, legacy migrations), so a
 * dropped key can resurface with a different value. Each pass re-merges the candidate,
 * puts back the parts that drifted, and repeats until the merged result matches the
 * untouched document — so a pruned payload never changes what the portfolio renders.
 */
export function prunePortfolioSettingsForPersist(settings: PortfolioSettings): PortfolioSettings {
  try {
    const expectedDocument = mergePortfolioSettings(settings);

    // Read path re-merges every snapshot with its own id and an empty theme list, and all
    // custom ids resolve to the same fallback theme — so one baseline covers them all.
    const snapshotBaseline = baselineSections(settings.customThemes[0]?.id ?? settings.themeId, []);

    let candidate: PortfolioSettings = (() => {
      const withPrunedThemes: PortfolioSettings = {
        ...settings,
        customThemes: pruneCustomThemes(settings.customThemes, snapshotBaseline),
      };
      // Snapshots are irrelevant to the root baseline, and emptying them keeps this
      // merge cheap on portfolios carrying many custom themes.
      const prunedSections = pruneAgainstBaseline(
        sectionsOf(withPrunedThemes),
        baselineSections(
          withPrunedThemes.themeId,
          withPrunedThemes.customThemes.map((theme) => ({
            ...theme,
            snapshot: {} as PortfolioCustomTheme['snapshot'],
          }))
        )
      );
      return {
        themeId: withPrunedThemes.themeId,
        customThemes: withPrunedThemes.customThemes,
        ...(isPlainObject(prunedSections) ? prunedSections : {}),
        ...(withPrunedThemes.updatedAt ? { updatedAt: withPrunedThemes.updatedAt } : {}),
      } as unknown as PortfolioSettings;
    })();

    for (let pass = 0; pass < MAX_CONVERGENCE_PASSES; pass += 1) {
      const actual = mergePortfolioSettings(candidate);
      const drifted = collectDiffPaths(expectedDocument, actual);
      if (drifted.length === 0) return candidate;

      // Some migrations key off the presence of a sibling, so restoring a single leaf is
      // not always enough — widen to its parent, grandparent… on each new pass.
      const repaired = structuredClone(candidate);
      for (const path of drifted) {
        const target = path.slice(0, Math.max(1, path.length - pass));
        const original = readAtPath(expectedDocument, target);
        if (original === undefined) continue;
        writeAtPath(repaired, target, structuredClone(original));
      }
      candidate = repaired;
    }

    return settings;
  } catch {
    return settings;
  }
}
