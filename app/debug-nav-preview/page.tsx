'use client';

import { useState } from 'react';
import { NavigationPanel } from '@/components/portfolio/PortfolioSettingsModal';
import { createDefaultPortfolioSettings } from '@/components/portfolio/portfolio-settings-types';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';

export default function DebugNavPreviewPage() {
  const [navigation, setNavigation] = useState<PortfolioNavSettings>(
    () => createDefaultPortfolioSettings().navigation
  );

  return (
    <div className="min-h-screen bg-[#f4f3ef] px-6 py-10">
      <div className="mx-auto max-w-xl rounded-[28px] border border-neutral-200 bg-white p-6 shadow-xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
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
