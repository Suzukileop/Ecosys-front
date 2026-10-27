'use client';

import { useLayoutEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PublicCreatorPortfolioSkeleton } from '@/components/portfolio/PublicCreatorPortfolioSkeleton';
import {
  DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  normalizePortfolioHeroBannerDesign,
  type PortfolioHeroBannerDesign,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  readHeroBannerDesignHint,
  resolveHeroBannerDesignFromSettings,
  writeHeroBannerDesignHint,
  readHeroLoadingSettingsHint,
  writeHeroLoadingSettingsHint,
} from '@/components/portfolio/portfolio-hero-banner-hint';
import { readLocalPortfolioSettings } from '@/lib/portfolio-settings-api';
import api from '@/lib/api';
import { mergePortfolioSettings, type PortfolioSettings } from './portfolio-settings-types';
import type { DesignPreviewTarget } from '@/lib/portfolio-design-preview';
import { PortfolioStackLoadingSkeleton } from './PortfolioStackLoadingSkeleton';
import { PortfolioToolsLoadingSkeleton } from './PortfolioToolsLoadingSkeleton';
import { PortfolioInfoLoadingSkeleton } from './PortfolioInfoLoadingSkeleton';
import type { PortfolioInfoDesign } from './portfolio-info-settings';
import type { PortfolioToolsDesign } from './portfolio-tools-settings';

function resolveLocalDesign(creatorKey: string): PortfolioHeroBannerDesign | null {
  if (!creatorKey) return null;
  const hinted = readHeroBannerDesignHint(creatorKey);
  if (hinted) return normalizePortfolioHeroBannerDesign(hinted);

  const local = readLocalPortfolioSettings(creatorKey);
  const fromSettings = local?.hero?.heroBannerDesign;
  if (fromSettings == null) return null;
  return normalizePortfolioHeroBannerDesign(fromSettings);
}

/**
 * Full-page hero skeleton for the active banner design
 * (same layouts as Hero → Design Banner previews in settings).
 * Always paints a skeleton immediately — never a blank screen.
 */
export function PortfolioLoadingPage({
  creatorKey: creatorKeyProp,
  initialDesign = DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  initialMode,
  designPreview,
}: {
  creatorKey?: string;
  initialDesign?: PortfolioHeroBannerDesign;
  initialMode?: 'light' | 'dark';
  designPreview?: DesignPreviewTarget | null;
} = {}) {
  const params = useParams();
  const creatorKey =
    creatorKeyProp?.trim() ||
    (typeof params?.creatorId === 'string' ? params.creatorId : '');

  const [design, setDesign] = useState<PortfolioHeroBannerDesign>(() => {
    return resolveLocalDesign(creatorKey) ?? normalizePortfolioHeroBannerDesign(initialDesign);
  });
  const [settings, setSettings] = useState<PortfolioSettings | null>(() => readHeroLoadingSettingsHint(creatorKey) ?? readLocalPortfolioSettings(creatorKey) ?? (initialMode ? mergePortfolioSettings({global:{colorMode:initialMode},hero:{colorModeOverride:initialMode}}) : null));

  useLayoutEffect(() => {
    if (!creatorKey) return;
    let cancelled = false;

    const local = resolveLocalDesign(creatorKey);

    void (async () => {
      try {
        const res = await api.get<Record<string, unknown>>(
          `/api/marketplace/creators/${encodeURIComponent(creatorKey)}`
        );
        const profile = res.data;
        const profileId = typeof profile.id === 'string' ? profile.id : '';
        const username =
          typeof profile.username === 'string' ? profile.username.trim() : '';

        const fromServer = resolveHeroBannerDesignFromSettings(profile.portfolioSettings);
        const fromUuid = profileId ? resolveLocalDesign(profileId) : null;
        const next = normalizePortfolioHeroBannerDesign(fromServer ?? fromUuid ?? local);
        if (cancelled) return;
        if (profile.portfolioSettings && typeof profile.portfolioSettings === 'object') {
          const resolved = mergePortfolioSettings(profile.portfolioSettings);
          setSettings(resolved);
          writeHeroLoadingSettingsHint([creatorKey, profileId, username], resolved);
        }

        writeHeroBannerDesignHint([creatorKey, profileId, username], next);
        setDesign(next);
      } catch {
        // Keep the skeleton already on screen.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [creatorKey]);

  if (designPreview?.section==='info') {
    return <PortfolioInfoLoadingSkeleton design={designPreview.design as PortfolioInfoDesign} settings={settings}/>;
  }
  if (designPreview?.section==='tools') {
    return <PortfolioToolsLoadingSkeleton design={designPreview.design as PortfolioToolsDesign} settings={settings}/>;
  }
  if (designPreview?.section==='stack' || designPreview?.section==='stackHeader') {
    return <PortfolioStackLoadingSkeleton section={designPreview.section} design={designPreview.design} settings={settings}/>;
  }
  return <PublicCreatorPortfolioSkeleton heroBannerDesign={design} settings={settings} />;
}
