'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createDefaultPortfolioSettings,
  mergePortfolioSettings,
  stampPortfolioSettingsUpdatedAt,
  type PortfolioNavSettings,
  type PortfolioSettings,
  type PortfolioSettingsSectionId,
} from '@/components/portfolio/portfolio-settings-types';
import { mergeGlobalSettings, type PortfolioGlobalSettingsPatch } from '@/components/portfolio/portfolio-global-settings';
import {
  DEFAULT_PORTFOLIO_THEME_ID,
  getPortfolioTheme,
  isBuiltinPortfolioThemeId,
  isCustomPortfolioThemeId,
  isLockedBuiltinPortfolioTheme,
  type PortfolioBuiltinThemeId,
  type PortfolioThemeId,
} from '@/components/portfolio/portfolio-themes';
import {
  createDraftCustomTheme,
  duplicateBuiltinAsCustom,
  duplicateCustomTheme,
  customThemeHasPendingChanges,
  refreshCustomThemeFromSettings,
  type PortfolioCustomTheme,
} from '@/components/portfolio/portfolio-custom-themes';
import { createBuiltinThemeSettings } from '@/components/portfolio/portfolio-builtin-theme-presets';
import {
  applyPortfolioColorMode,
  applyGlobalPalettePair,
  patchActiveGlobalPalette,
  type PortfolioColorMode,
} from '@/components/portfolio/portfolio-color-mode';
import type { PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import { applyNavPaletteToSettings } from '@/components/portfolio/portfolio-nav-palette-settings';
import { applyWorkPaletteToSettings } from '@/components/portfolio/portfolio-work-palette-settings';
import { applyExperiencePaletteToSettings } from '@/components/portfolio/portfolio-experience-palette-settings';
import { applyAboutPaletteToSettings } from '@/components/portfolio/portfolio-about-palette-settings';
import {
  isPortfolioSettingsEmpty,
  migrateLocalPortfolioSettingsIfNeeded,
  syncOwnerPortfolioSettings,
  updateCreatorPortfolioSettingsWithRetry,
  writeLocalPortfolioSettings,
  type PortfolioSettingsPersistStatus,
} from '@/lib/portfolio-settings-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';

type PortfolioContentSectionId = Exclude<PortfolioSettingsSectionId, 'theme' | 'navigation' | 'skills'>;

const SAVE_DEBOUNCE_MS = 400;
const HISTORY_LIMIT = 50;
/** Coalesce rapid tweaks (sliders) into one undo step. */
const HISTORY_COALESCE_MS = 450;

function clonePortfolioSettings(settings: PortfolioSettings): PortfolioSettings {
  return mergePortfolioSettings(structuredClone(settings));
}

function settingsContentEqual(a: PortfolioSettings, b: PortfolioSettings): boolean {
  const strip = (value: PortfolioSettings) => {
    const { updatedAt, ...rest } = value;
    void updatedAt;
    return rest;
  };
  try {
    return JSON.stringify(strip(a)) === JSON.stringify(strip(b));
  } catch {
    return false;
  }
}

function resolveVisitorSettings(serverSettings: unknown | undefined): PortfolioSettings {
  if (!isPortfolioSettingsEmpty(serverSettings)) {
    return mergePortfolioSettings(serverSettings);
  }
  return createDefaultPortfolioSettings();
}

function refreshActiveCustomTheme(current: PortfolioSettings): PortfolioSettings {
  if (!isCustomPortfolioThemeId(current.themeId)) return current;
  return {
    ...current,
    customThemes: current.customThemes.map((theme) =>
      theme.id === current.themeId ? refreshCustomThemeFromSettings(theme, current) : theme
    ),
  };
}

/**
 * Editorial Warm is immutable. Personalization while it is active forks a copy.
 * Noir / Blanc is editable in place — no forced duplication.
 */
function forkBuiltinOnPersonalization(current: PortfolioSettings): PortfolioSettings {
  if (isCustomPortfolioThemeId(current.themeId)) {
    return refreshActiveCustomTheme(current);
  }

  if (!isLockedBuiltinPortfolioTheme(current.themeId)) {
    return current;
  }

  const label = getPortfolioTheme(current.themeId).label;
  const draft = isBuiltinPortfolioThemeId(current.themeId)
    ? duplicateBuiltinAsCustom(current, `${label} copie`, current.themeId)
    : createDraftCustomTheme(current, `${label} copie`);
  return {
    ...current,
    themeId: draft.id,
    customThemes: [...current.customThemes, draft],
  };
}

function applySnapshotTheme(
  current: PortfolioSettings,
  themeId: PortfolioThemeId
): PortfolioSettings {
  if (themeId === current.themeId && isBuiltinPortfolioThemeId(themeId)) {
    return current;
  }

  if (isBuiltinPortfolioThemeId(themeId)) {
    // Restore pristine builtin defaults; keep saved custom themes in the list.
    return createBuiltinThemeSettings(themeId, current.customThemes);
  }

  const custom = current.customThemes.find((theme) => theme.id === themeId);
  if (!custom) return current;

  return mergePortfolioSettings({
    ...custom.snapshot,
    themeId: custom.id,
    customThemes: current.customThemes,
  });
}

export function usePortfolioSettings(
  creatorId: string,
  options?: {
    initialSettings?: unknown;
    canEdit?: boolean;
  }
) {
  const canEdit = options?.canEdit ?? false;
  const initialSettings = options?.initialSettings;
  const [settings, setSettings] = useState<PortfolioSettings>(() => {
    if (!isPortfolioSettingsEmpty(initialSettings)) {
      return mergePortfolioSettings(initialSettings);
    }
    return createDefaultPortfolioSettings();
  });
  const [hydrated, setHydrated] = useState(false);
  const [persistStatus, setPersistStatus] = useState<PortfolioSettingsPersistStatus>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSettingsRef = useRef<PortfolioSettings>(settings);
  const ownerSyncedRef = useRef(false);
  const saveGenerationRef = useRef(0);
  const lastErrorFlashAtRef = useRef(0);

  useEffect(() => {
    latestSettingsRef.current = settings;
  }, [settings]);

  const writeLocalCache = useCallback(
    (next: PortfolioSettings) => {
      if (!canEdit) return;
      writeLocalPortfolioSettings(creatorId, next);
    },
    [canEdit, creatorId]
  );

  const persistToBackend = useCallback(
    (next: PortfolioSettings, immediate = false) => {
      if (!canEdit) return;
      latestSettingsRef.current = next;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      const generation = ++saveGenerationRef.current;
      setPersistStatus('saving');

      const run = async () => {
        try {
          await updateCreatorPortfolioSettingsWithRetry(next);
          if (saveGenerationRef.current === generation) {
            setPersistStatus('saved');
          }
        } catch (error) {
          if (saveGenerationRef.current !== generation) return;
          setPersistStatus('error');
          const now = Date.now();
          // Avoid toast spam while the user keeps typing.
          if (now - lastErrorFlashAtRef.current > 4000) {
            lastErrorFlashAtRef.current = now;
            pushFlashFeedback({
              variant: 'error',
              title: 'Settings not saved',
              description:
                error instanceof Error
                  ? error.message
                  : 'Your changes are kept on this device. We will retry automatically.',
              durationMs: 6000,
            });
          }
        }
      };

      if (immediate) {
        void run();
        return;
      }

      saveTimerRef.current = setTimeout(() => {
        void run();
      }, SAVE_DEBOUNCE_MS);
    },
    [canEdit]
  );

  const flushPendingSave = useCallback(() => {
    if (!canEdit) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    persistToBackend(latestSettingsRef.current, true);
  }, [canEdit, persistToBackend]);

  const commitSettings = useCallback(
    (next: PortfolioSettings, immediate = false) => {
      const stamped = stampPortfolioSettingsUpdatedAt(next);
      latestSettingsRef.current = stamped;
      setSettings(stamped);
      writeLocalCache(stamped);
      persistToBackend(stamped, immediate);
      return stamped;
    },
    [persistToBackend, writeLocalCache]
  );

  const pastRef = useRef<PortfolioSettings[]>([]);
  const futureRef = useRef<PortfolioSettings[]>([]);
  const lastHistoryPushAtRef = useRef(0);
  const [historyTick, setHistoryTick] = useState(0);

  const bumpHistory = useCallback(() => {
    setHistoryTick((tick) => tick + 1);
  }, []);

  const pushHistory = useCallback(
    (previous: PortfolioSettings) => {
      const now = Date.now();
      if (
        pastRef.current.length > 0 &&
        now - lastHistoryPushAtRef.current < HISTORY_COALESCE_MS
      ) {
        lastHistoryPushAtRef.current = now;
        return;
      }
      pastRef.current = [
        ...pastRef.current.slice(-(HISTORY_LIMIT - 1)),
        clonePortfolioSettings(previous),
      ];
      futureRef.current = [];
      lastHistoryPushAtRef.current = now;
      bumpHistory();
    },
    [bumpHistory]
  );

  const clearHistory = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    lastHistoryPushAtRef.current = 0;
    bumpHistory();
  }, [bumpHistory]);

  const saveSettings = useCallback(
    (next: PortfolioSettings, immediate = false) => {
      commitSettings(next, immediate);
    },
    [commitSettings]
  );

  const applySettings = useCallback(
    (updater: (current: PortfolioSettings) => PortfolioSettings) => {
      const current = latestSettingsRef.current;
      const next = updater(current);
      if (settingsContentEqual(current, next)) return;
      pushHistory(current);
      commitSettings(next);
    },
    [commitSettings, pushHistory]
  );

  const undoSettings = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [
      ...futureRef.current,
      clonePortfolioSettings(latestSettingsRef.current),
    ];
    lastHistoryPushAtRef.current = 0;
    bumpHistory();
    commitSettings(previous);
  }, [bumpHistory, commitSettings]);

  const redoSettings = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [
      ...pastRef.current,
      clonePortfolioSettings(latestSettingsRef.current),
    ];
    lastHistoryPushAtRef.current = 0;
    bumpHistory();
    commitSettings(next);
  }, [bumpHistory, commitSettings]);

  const canUndo = historyTick >= 0 && pastRef.current.length > 0;
  const canRedo = historyTick >= 0 && futureRef.current.length > 0;

  useEffect(() => {
    if (!canEdit) {
      setSettings(resolveVisitorSettings(initialSettings));
      setHydrated(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const resolved = await syncOwnerPortfolioSettings(creatorId, initialSettings);
        if (!cancelled) {
          setSettings(resolved);
          writeLocalCache(resolved);
          latestSettingsRef.current = resolved;
          ownerSyncedRef.current = true;
          setPersistStatus('idle');
          pastRef.current = [];
          futureRef.current = [];
          lastHistoryPushAtRef.current = 0;
          setHistoryTick((tick) => tick + 1);
        }
      } catch {
        if (!cancelled) {
          const migrated = await migrateLocalPortfolioSettingsIfNeeded(creatorId, initialSettings);
          const fallback = migrated ?? mergePortfolioSettings(initialSettings);
          setSettings(fallback);
          writeLocalCache(fallback);
          latestSettingsRef.current = fallback;
          ownerSyncedRef.current = true;
          setPersistStatus('idle');
          pastRef.current = [];
          futureRef.current = [];
          lastHistoryPushAtRef.current = 0;
          setHistoryTick((tick) => tick + 1);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [creatorId, canEdit, initialSettings, writeLocalCache]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!canEdit) return;

    const flush = () => flushPendingSave();
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);

    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      flushPendingSave();
    };
  }, [canEdit, flushPendingSave]);

  const updateSection = useCallback(
    <T extends PortfolioContentSectionId>(
      sectionId: T,
      patch: Partial<PortfolioSettings[T]>
    ) => {
      applySettings((current) => {
        if (sectionId === 'work') {
          const next = { ...current.work, ...patch };
          const work =
            next.useHeroPalette === false
              ? next
              : ({
                  ...next,
                  ...applyWorkPaletteToSettings(next),
                  useHeroPalette: true,
                } as typeof next);
          return forkBuiltinOnPersonalization({ ...current, work });
        }

        if (sectionId === 'experience') {
          const next = { ...current.experience, ...patch };
          const experience =
            next.useHeroPalette === false
              ? next
              : ({
                  ...next,
                  ...applyExperiencePaletteToSettings(next),
                  useHeroPalette: true,
                } as typeof next);
          return forkBuiltinOnPersonalization({ ...current, experience });
        }

        if (sectionId === 'about') {
          const next = { ...current.about, ...patch };
          const about =
            next.useHeroPalette === false
              ? next
              : ({
                  ...next,
                  ...applyAboutPaletteToSettings(next),
                  useHeroPalette: true,
                } as typeof next);
          return forkBuiltinOnPersonalization({ ...current, about });
        }

        const withPatch = {
          ...current,
          [sectionId]: { ...current[sectionId], ...patch },
        };
        return forkBuiltinOnPersonalization(withPatch);
      });
    },
    [applySettings]
  );

  const resetSettings = useCallback(() => {
    saveSettings(createDefaultPortfolioSettings(), true);
  }, [saveSettings]);

  /** Restore a builtin theme to factory defaults (works even when already active). */
  const resetBuiltinTheme = useCallback(
    (themeId: PortfolioBuiltinThemeId) => {
      applySettings((current) => createBuiltinThemeSettings(themeId, current.customThemes));
    },
    [applySettings]
  );

  const setThemeId = useCallback(
    (themeId: PortfolioThemeId) => {
      applySettings((current) => applySnapshotTheme(current, themeId));
    },
    [applySettings]
  );

  const updateNavigation = useCallback(
    (patch: Partial<PortfolioNavSettings>) => {
      applySettings((current) => {
        const next = { ...current.navigation, ...patch };
        const navigation =
          next.useNavPalette === false
            ? next
            : {
                ...next,
                ...applyNavPaletteToSettings(next),
                useNavPalette: true,
              };
        return forkBuiltinOnPersonalization({
          ...current,
          navigation,
        });
      });
    },
    [applySettings]
  );

  const updateGlobal = useCallback(
    (patch: PortfolioGlobalSettingsPatch) => {
      applySettings((current) => {
        const withPatch = {
          ...current,
          global: mergeGlobalSettings(current.global, patch),
        };
        return forkBuiltinOnPersonalization(withPatch);
      });
    },
    [applySettings]
  );

  /** Dark / light: select Global palette pair slot and paint linked sections. */
  const setColorMode = useCallback(
    (mode: PortfolioColorMode) => {
      applySettings((current) =>
        forkBuiltinOnPersonalization(applyPortfolioColorMode(current, mode))
      );
    },
    [applySettings]
  );

  /** Edit tokens on the active Global dark/light slot, then repaint the site. */
  const patchGlobalPalette = useCallback(
    (patch: Partial<PortfolioHeroPalette>) => {
      applySettings((current) =>
        forkBuiltinOnPersonalization(patchActiveGlobalPalette(current, patch))
      );
    },
    [applySettings]
  );

  /** Apply a coupled dark+light preset into Global and paint the active mode. */
  const setGlobalPalettePair = useCallback(
    (
      paletteDark: PortfolioHeroPalette,
      paletteLight?: PortfolioHeroPalette,
      family?: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise' | 'custom'
    ) => {
      applySettings((current) =>
        forkBuiltinOnPersonalization(
          applyGlobalPalettePair(current, paletteDark, paletteLight, family)
        )
      );
    },
    [applySettings]
  );

  const saveCustomTheme = useCallback(
    (themeId: string, name?: string): boolean => {
      const current = latestSettingsRef.current;
      const theme = current.customThemes.find((item) => item.id === themeId);
      if (!theme) return false;

      const nextName = name?.trim() || theme.name;
      const nameChanged = nextName !== theme.name;
      const contentChanged = customThemeHasPendingChanges(theme, current);
      if (!nameChanged && !contentChanged && theme.saved) return false;

      const refreshed = refreshCustomThemeFromSettings(theme, current);
      applySettings(() => ({
        ...current,
        themeId,
        customThemes: current.customThemes.map((item) =>
          item.id === themeId
            ? {
                ...refreshed,
                name: nextName,
                saved: true,
              }
            : item
        ),
      }));
      return true;
    },
    [applySettings]
  );

  const renameCustomTheme = useCallback(
    (themeId: string, name: string): boolean => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      const current = latestSettingsRef.current;
      const theme = current.customThemes.find((item) => item.id === themeId);
      if (!theme || theme.name === trimmed) return false;

      applySettings(() => ({
        ...current,
        customThemes: current.customThemes.map((item) =>
          item.id === themeId
            ? { ...item, name: trimmed, updatedAt: new Date().toISOString() }
            : item
        ),
      }));
      return true;
    },
    [applySettings]
  );

  const duplicateTheme = useCallback(
    (themeId: PortfolioThemeId) => {
      applySettings((current) => {
        let copy: PortfolioCustomTheme;
        if (isBuiltinPortfolioThemeId(themeId)) {
          const label = getPortfolioTheme(themeId).label;
          const sourceSettings =
            current.themeId === themeId
              ? current
              : createBuiltinThemeSettings(themeId, current.customThemes);
          copy = duplicateBuiltinAsCustom(sourceSettings, `${label} copie`, themeId);
        } else {
          const source = current.customThemes.find((theme) => theme.id === themeId);
          if (!source) return current;
          copy = duplicateCustomTheme(source);
        }
        return {
          ...current,
          themeId: copy.id,
          customThemes: [...current.customThemes, copy],
        };
      });
    },
    [applySettings]
  );

  const deleteCustomTheme = useCallback(
    (themeId: string) => {
      if (!isCustomPortfolioThemeId(themeId)) return;
      applySettings((current) => {
        const nextThemes = current.customThemes.filter((theme) => theme.id !== themeId);
        const nextThemeId =
          current.themeId === themeId ? DEFAULT_PORTFOLIO_THEME_ID : current.themeId;
        return {
          ...current,
          themeId: nextThemeId,
          customThemes: nextThemes,
        };
      });
    },
    [applySettings]
  );

  return {
    settings,
    hydrated,
    persistStatus,
    ownerSynced: ownerSyncedRef.current,
    persist: saveSettings,
    flushPendingSave,
    updateSection,
    resetSettings,
    resetBuiltinTheme,
    setThemeId,
    updateNavigation,
    updateGlobal,
    setColorMode,
    patchGlobalPalette,
    setGlobalPalettePair,
    saveCustomTheme,
    renameCustomTheme,
    duplicateTheme,
    deleteCustomTheme,
    undoSettings,
    redoSettings,
    canUndo,
    canRedo,
    clearHistory,
  };
}
