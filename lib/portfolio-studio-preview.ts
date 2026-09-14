import type { PortfolioNavChromeLink } from '@/components/portfolio/portfolio-nav-extras';

export const PORTFOLIO_STUDIO_PREVIEW_SOURCE = 'noprobleme-portfolio-studio';
export const PORTFOLIO_STUDIO_EMBED_QUERY = 'embed';

export type PortfolioStudioPreviewMeta = {
  availableTools: string[];
  availableWorks: { id: string; title: string; imageUrl: string }[];
  navSocialLinkOptions: PortfolioNavChromeLink[];
};

export type PortfolioStudioPreviewMessage =
  | {
      source: typeof PORTFOLIO_STUDIO_PREVIEW_SOURCE;
      type: 'ready';
      meta: PortfolioStudioPreviewMeta;
    }
  | {
      source: typeof PORTFOLIO_STUDIO_PREVIEW_SOURCE;
      type: 'meta';
      meta: PortfolioStudioPreviewMeta;
    }
  | {
      source: typeof PORTFOLIO_STUDIO_PREVIEW_SOURCE;
      type: 'apply-settings';
      settings: unknown;
    }
  | {
      source: typeof PORTFOLIO_STUDIO_PREVIEW_SOURCE;
      type: 'color-mode-change';
      mode: 'light' | 'dark';
    }
  | {
      source: typeof PORTFOLIO_STUDIO_PREVIEW_SOURCE;
      type: 'scroll-to-section';
      sectionId: string;
    };

export function withPortfolioStudioEmbed(path: string): string {
  const hashIndex = path.indexOf('#');
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const base = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const joiner = base.includes('?') ? '&' : '?';
  return `${base}${joiner}${PORTFOLIO_STUDIO_EMBED_QUERY}=1${hash}`;
}

export function isPortfolioStudioEmbedParam(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === '1' || raw === 'true';
}

export function isPortfolioStudioPreviewMessage(
  data: unknown
): data is PortfolioStudioPreviewMessage {
  if (!data || typeof data !== 'object') return false;
  const record = data as { source?: unknown; type?: unknown };
  if (record.source !== PORTFOLIO_STUDIO_PREVIEW_SOURCE) return false;
  return (
    record.type === 'ready' ||
    record.type === 'meta' ||
    record.type === 'apply-settings' ||
    record.type === 'color-mode-change' ||
    record.type === 'scroll-to-section'
  );
}

/** Settings pane id → live-preview DOM id. Navigation has no page block. */
export function previewAnchorForSettingsSection(sectionId: string): string | null {
  if (sectionId === 'navigation') return null;
  if (sectionId === 'theme') return 'hero';
  return sectionId;
}

export const EMPTY_PORTFOLIO_STUDIO_PREVIEW_META: PortfolioStudioPreviewMeta = {
  availableTools: [],
  availableWorks: [],
  navSocialLinkOptions: [],
};
