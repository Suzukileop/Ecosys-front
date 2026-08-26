import type { CSSProperties } from 'react';
import type { PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
import type { PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import type { PortfolioSkillRef } from '@/components/portfolio/skill-usage-descriptions';

export type HeroStat = { value: string; label: string };

export type HeroSocialLink = {
  id: string;
  platform: string;
  url: string;
  label: string;
};

export type PortfolioHeroData = {
  creatorId: string;
  fullName: string;
  nameLead: string;
  nameAccent: string;
  specialite?: string | null;
  description: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  isAvailable?: boolean;
  responseTimeLabel?: string | null;
  yearsOfExperience?: number | null;
  workCount?: number;
  locationLabel?: string | null;
  stats: HeroStat[];
  socialLinks: HeroSocialLink[];
  tools: string[];
  /** Rich metadata for card designs; tools remains the backward-compatible identity list. */
  toolDetails?: PortfolioSkillRef[];
  contactHref: string;
  showWorkCta: boolean;
  showContactCta: boolean;
  navItems: { id: string; label: string }[];
  presentation: PortfolioHeroPresentationSettings;
  /** When a global page background is active, the hero uses the global color instead of its own. */
  suppressBackground?: boolean;
  globalBackgroundStyle?: CSSProperties;
  /** Fade geometric hero motif on scroll (cinematic / editorial motion profiles). */
  geomFadeEnabled?: boolean;
  /** Global motion profile — gates CSS hero enter animations. */
  motionProfile?: PortfolioGlobalMotionProfile;
  /** When set (pages mode), in-page hash CTAs switch the active page instead of scrolling. */
  onNavigateSection?: (sectionId: string) => void;
  /** Primary work CTA target — default `#work`. */
  workHref?: string;
  /**
   * Selected works banner — first portfolio posts with media (thumbnails).
   */
  featuredWorks?: { id: string; title: string; imageUrl: string; href?: string }[];
  /** Global left/right gutters for hero copy + absolute layers. */
  contentGutter?: PortfolioContentGutter;
  /** Max-width class from Global → Content width (standard / wide / full). */
  contentWidthClass?: string;
  /** Active Global color mode — picks motif opacity (light vs dark). */
  colorMode?: 'light' | 'dark';
};
