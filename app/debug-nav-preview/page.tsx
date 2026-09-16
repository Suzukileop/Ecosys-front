'use client';

import { useState } from 'react';
import { NavigationPanel } from '@/components/portfolio/PortfolioSettingsModal';
import { createDefaultPortfolioSettings } from '@/components/portfolio/portfolio-settings-types';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  portfolioPaletteCssVars,
  resolveActivePortfolioPalette,
} from '@/components/portfolio/portfolio-color-mode';

export default function DebugNavPreviewPage() {
  const defaults = createDefaultPortfolioSettings();
  const global = { ...defaults.global, colorMode: 'light' as const };
  const dockPalette = resolveActivePortfolioPalette(global);

  const [navigation, setNavigation] = useState<PortfolioNavSettings>(
    () => defaults.navigation
  );

  return (
    <div
      className="portfolio-studio-dock flex h-screen w-full max-w-md flex-col overflow-hidden rounded-2xl border"
      data-color-mode="light"
      style={{
        ...portfolioPaletteCssVars(dockPalette),
        backgroundColor: dockPalette.fond,
        color: dockPalette.texteFort,
        borderColor: dockPalette.bordure,
      }}
    >
      <div
        className="portfolio-studio-dock-surface min-h-0 flex-1 overflow-y-auto px-5 py-5"
        style={{ backgroundColor: dockPalette.fond, color: dockPalette.texteFort }}
      >
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] opacity-50">
          Settings / Navigation
        </p>
        <NavigationPanel
          navigation={navigation}
          onChange={(patch) => setNavigation((prev) => ({ ...prev, ...patch }))}
          navSocialLinkOptions={[]}
          showColorModeToggleInNav={false}
          onGlobalChange={() => {}}
        />
      </div>
    </div>
  );
}
