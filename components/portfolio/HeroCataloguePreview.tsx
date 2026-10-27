'use client';

import { useEffect, useRef, useState } from 'react';
import { PortfolioHeroSection } from './PortfolioHeroSection';
import { PortfolioThemeRoot } from './PortfolioThemeRoot';
import { pickHeroPresentationSettings } from './portfolio-hero-settings';
import { heroBannerDesignSettingsPatch, type PortfolioHeroBannerDesign } from './portfolio-hero-banner-settings';
import type { PortfolioSettings } from './portfolio-settings-types';
import { PORTFOLIO_STUDIO_PREVIEW_SOURCE } from '@/lib/portfolio-studio-preview';

/** Catalogue-only entry point: no portfolio sections, profile effects or editor initialization. */
export function HeroCataloguePreview({ design, avatarUrl }: { design: PortfolioHeroBannerDesign; avatarUrl: string }) {
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== parent ||
        event.data?.source !== PORTFOLIO_STUDIO_PREVIEW_SOURCE || event.data.type !== 'apply-settings' || !event.data.settings?.hero) return;
      setSettings(event.data.settings);
    };
    addEventListener('message', receive);
    parent.postMessage({ source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'design-preview-ready' }, location.origin);
    return () => removeEventListener('message', receive);
  }, []);
  useEffect(() => {
    if (!settings || !root.current) return;
    const report = () => {
      if (!root.current?.querySelector('#hero > *')) return;
      parent.postMessage({ source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'design-preview-size', height: root.current.scrollHeight }, location.origin);
    };
    const observer = new ResizeObserver(report);
    observer.observe(root.current);
    const mutations = new MutationObserver(report);
    mutations.observe(root.current, { childList: true, subtree: true });
    report();
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, [settings]);
  if (!settings) return null;
  const presentation = pickHeroPresentationSettings({ ...settings.hero, ...heroBannerDesignSettingsPatch(design) });
  return <PortfolioThemeRoot themeId={settings.themeId} customThemes={settings.customThemes} colorMode={settings.global.colorMode ?? 'dark'}>
    <div ref={root}>
      <PortfolioHeroSection creatorId="catalogue" fullName="Alex Martin" nameLead="Alex" nameAccent="Martin"
        specialite="Designer & developer" description="Independent designer and developer. I build clear, fast websites and brands for small studios."
        avatarUrl={avatarUrl} isAvailable yearsOfExperience={8} stats={[]} socialLinks={[]}
        tools={['Figma', 'React', 'TypeScript', 'Next.js']} contactHref="#contact" workHref="#work"
        showWorkCta showContactCta navItems={[]} presentation={presentation} contentGutter={settings.global.contentGutter}
        featuredWorks={['/landing/v2/hero.jpg', '/landing/audience/seller.jpg', '/landing/hero/hero-pro.jpg', '/landing/showcase/portfolio.jpg'].map((imageUrl, index) => ({ id: String(index), title: ['Studio identity', 'Digital experience', 'Selected project', 'Portfolio'][index], imageUrl }))}
      />
    </div>
  </PortfolioThemeRoot>;
}
