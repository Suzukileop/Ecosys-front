'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CreatorStudioProfileTab } from '@/components/creator/studio/CreatorStudioProfileTab';
import { PortfolioPresencePicker } from '@/components/portfolio/PortfolioPresencePicker';
import {
  getPortfolioPresenceOption,
  type PortfolioPresenceKind,
} from '@/components/portfolio/portfolio-presence';
import { mergePortfolioSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  getCreatorPortfolioSettings,
  updateCreatorPortfolioSettings,
} from '@/lib/portfolio-settings-api';
import { PortfolioLivePreview } from '@/components/portfolio/PortfolioLivePreview';
import { GenerateCvLink } from '@/components/portfolio/cv/GenerateCvLink';
import {
  PORTFOLIO_PRIMARY_PILL,
  PORTFOLIO_SECONDARY_PILL,
} from '@/components/portfolio/PortfolioInformationChrome';
import { PortfolioShareDialog } from '@/components/portfolio/PortfolioShareDialog';
import { buildCreatorPortfolioUrl } from '@/lib/portfolio-url';
import { NAVBAR_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * My Portfolio (/studio), laid out like News, Providers and Products:
 *  - the editor: the identity block and the open section's form in the main column, and the News rail
 *    on the right (from md) — the "Sections" box (grouped, the open one checked, empty ones marked),
 *    then the Preview pill under it;
 *  - the page's other actions — Open live page, Generate CV, Switch format — as a frameless list (X's
 *    left nav: 20px glyph, 16px label, a rounded fill under the pointer), then an outlined Share pill
 *    that opens the share dialog (networks + the link to copy): a column of their own on the left from
 *    xl (three columns, the form in the middle), under "Sections" below;
 *  - the live preview: full screen over everything (the site's navbar included), rising in and
 *    sinking out with a short transition; its own chrome holds "Editor" (and Escape) and the copy link.
 *
 * Gone: the "Explore templates" tab (it only said "coming soon"), the Edit / Live preview tabs (Preview
 * is a button; the preview has its own way back), "Switch format" posing as a tab (it resets the
 * workspace to the format picker: an action, in the list with the current format named), and the
 * "Portfolio space" heading pinned right like a link.
 */

type PortfolioTabId = 'information' | 'preview';

/** Soft one-shot enter when the workspace panel key changes — no fade-out, no pulse. */
const PANEL_IN_STYLE = {
  animation: 'pf-workspace-panel-in 360ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
} as const;

/** One action of the frameless list — X's left nav row: glyph, label, a quiet value right. */
const ACTION_ROW =
  'flex h-12 w-full items-center gap-4 rounded-full px-3 text-left text-[16px] font-medium leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

function ActionGlyph({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

/**
 * The page's actions as a frameless list — no box, no title: the rows say what they do (the live page
 * opens in a new tab; the format row names the current one in its tooltip). Under a hairline, the Share
 * button — an outlined pill, so it never competes with the solid Preview pill — opens the share dialog.
 */
function PortfolioActionList({
  shareUrl,
  shareText,
  formatTitle,
  onSwitchFormat,
}: {
  shareUrl: string;
  shareText: string;
  formatTitle: string;
  onSwitchFormat: () => void;
}) {
  const t = useT();
  const [shareOpen, setShareOpen] = useState(false);
  const closeShare = useCallback(() => setShareOpen(false), []);
  return (
    <div className="flex flex-col">
      <nav aria-label={t('Your page')} className="flex flex-col">
        <a href={shareUrl} target="_blank" rel="noopener" className={ACTION_ROW}>
          <ActionGlyph>
            <path d="M14 4h6v6M20 4l-9 9" />
            <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
          </ActionGlyph>
          <span className="min-w-0 flex-1 truncate">{t('Open live page')}</span>
        </a>
        <GenerateCvLink className={ACTION_ROW} />
        <button type="button" onClick={onSwitchFormat} className={ACTION_ROW} title={t('Current format: {formatTitle}', { formatTitle })}>
          <ActionGlyph>
            <path d="M4 7.5h13.5M14 4l3.5 3.5L14 11M20 16.5H6.5M10 13l-3.5 3.5L10 20" />
          </ActionGlyph>
          <span className="min-w-0 flex-1 truncate">{t('Switch format')}</span>
        </button>
      </nav>

      <div className="mx-3 mb-4 mt-3 h-px bg-[color:var(--gn-line)]" aria-hidden />
      <button type="button" onClick={() => setShareOpen(true)} className={`${PORTFOLIO_SECONDARY_PILL} w-full`}>
        <ActionGlyph>
          <path d="M12 4v11M7.5 8.5 12 4l4.5 4.5" />
          <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
        </ActionGlyph>
        {t('Share')}
      </button>
      <PortfolioShareDialog open={shareOpen} onClose={closeShare} shareUrl={shareUrl} shareText={shareText} />
    </div>
  );
}

export function MyPortfolioWorkspace() {
  const t = useT();
  const { user, hasRole, isLoading } = useAuth();
  const [tab, setTab] = useState<PortfolioTabId>('information');
  /* The preview plays its exit (~220ms) before it unmounts, so leaving is as soft as entering. */
  const [previewClosing, setPreviewClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const openPreview = useCallback(() => {
    if (closeTimerRef.current != null) window.clearTimeout(closeTimerRef.current);
    setPreviewClosing(false);
    setTab('preview');
  }, []);
  const exitPreview = useCallback(() => {
    if (closeTimerRef.current != null) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPreviewClosing(true);
    closeTimerRef.current = window.setTimeout(
      () => {
        closeTimerRef.current = null;
        setPreviewClosing(false);
        setTab('information');
      },
      reduce ? 0 : 220
    );
  }, []);
  useEffect(
    () => () => {
      if (closeTimerRef.current != null) window.clearTimeout(closeTimerRef.current);
    },
    []
  );
  const [presenceKind, setPresenceKind] = useState<PortfolioPresenceKind | null>(null);
  const selectedPresence = getPortfolioPresenceOption(presenceKind);

  const isCreator = hasRole('ROLE_CREATOR');
  const isPreview = tab === 'preview';


  const persistPresenceKind = useCallback(async (kind: PortfolioPresenceKind) => {
    setPresenceKind(kind);
    try {
      const raw = await getCreatorPortfolioSettings();
      const merged = mergePortfolioSettings(raw);
      await updateCreatorPortfolioSettings({
        ...merged,
        global: { ...merged.global, presenceKind: kind },
      });
    } catch {
      /* local selection still applies in this session */
    }
  }, []);

  const resetPresence = useCallback(() => {
    setPresenceKind(null);
    setTab('information');
  }, []);

  if (isLoading) {
    return (
      <div className={`news-theme news-feed news-mono ${NAVBAR_FRAME_CLASS}`}>
        <div className="bg-[color:var(--gn-surface)] px-6 py-16 text-center text-[15px] text-[color:var(--gn-ink2)]">
          {t('Loading…')}
        </div>
      </div>
    );
  }

  if (!isCreator || !user) {
    return (
      <div className={`news-theme news-feed news-mono ${NAVBAR_FRAME_CLASS}`}>
        <div className="bg-[color:var(--gn-surface)] px-6 py-16 text-center">
          <p className="text-[15px] text-[color:var(--gn-ink2)]">{t('A creator account is required to manage your portfolio.')}</p>
          <Link href="/feed" className={`mt-6 ${PORTFOLIO_PRIMARY_PILL}`}>
            {t('Back to News')}
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedPresence) {
    return (
      // The navbar's frame (NAVBAR_FRAME_CLASS): edges under the wordmark and the avatar.
      <div className={`news-theme news-feed ${NAVBAR_FRAME_CLASS}`}>
        <PortfolioPresencePicker onSelect={(kind) => void persistPresenceKind(kind)} />
      </div>
    );
  }

  const shareUrl = buildCreatorPortfolioUrl(user.id, user.username);

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] max-w-full min-w-0 flex-col bg-transparent pb-10 pt-5 sm:pt-6">
      <h1 className="sr-only">{t('My portfolio — {title}', { title: selectedPresence.title })}</h1>
      {/* The editor stays mounted under the preview: leaving the preview reveals it exactly as it was. */}
      <div className={`pf-x news-theme news-feed news-mono min-w-0 flex-1 ${NAVBAR_FRAME_CLASS}`}>
        <div className="pf-workspace-panel-in" style={PANEL_IN_STYLE}>
          <CreatorStudioProfileTab
            variant="portfolio"
            portfolioNavSide="right"
            allowedSections={selectedPresence.sections}
            sectionsNavTitle={selectedPresence.title}
            onPortfolioPreview={openPreview}
            railPrimary={
              <button type="button" onClick={openPreview} className={`${PORTFOLIO_PRIMARY_PILL} h-12 w-full`}>
                {t('Preview')}
              </button>
            }
            railActions={
              <PortfolioActionList
                shareUrl={shareUrl}
                shareText={`${user.fullName?.trim() || 'My'} — portfolio`}
                formatTitle={selectedPresence.title}
                onSwitchFormat={resetPresence}
              />
            }
          />
        </div>
      </div>

      {/* Full screen, over the site's navbar too: portalled to <body>. Rendered in place it stayed inside
          the page content's stacking context (z-10, under the sticky navbar's z-40), so the navbar
          covered the preview's own header; and the animated panel's transform would trap it as well. */}
      {isPreview
        ? createPortal(
            <PortfolioLivePreview creatorId={user.id} username={user.username} onExit={exitPreview} closing={previewClosing} />,
            document.body
          )
        : null}
    </div>
  );
}
