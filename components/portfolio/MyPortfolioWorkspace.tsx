'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { ACCENT_ORANGE, brandCtaClass } from '@/components/landing/landingBrand';
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
import { buildCreatorPortfolioUrl } from '@/lib/portfolio-url';
import { PORTFOLIO_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';

type PortfolioTabId = 'information' | 'templates' | 'preview';
type PortfolioNavSide = 'left' | 'right';

const PORTFOLIO_NAV_SIDE: PortfolioNavSide = 'left';

const PRESENCE_SPACE_TITLES: Record<PortfolioPresenceKind, string> = {
  portfolio: 'Portfolio space',
  storefront: 'Storefront space',
  business: 'Business space',
};

/** Same ink as DashboardNavbarLinks — one glyph colour across the product chrome. */
const NAV_IDLE = 'text-[#222222] dark:text-neutral-300';
const NAV_ACTIVE = 'text-[#0A0A0A] dark:text-white';

/**
 * Hero copy action — sits outside the Live Preview toolbar, up on the secondary nav row.
 * Black slab in light mode so it reads as a deliberate share control, not a muted text link.
 */
function CopyLiveLinkHero({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const onCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }, [shareUrl]);

  return (
    <>
      <button
        type="button"
        onClick={() => void onCopy()}
        aria-label={copied ? 'Link copied' : 'Copy live link'}
        className="group relative inline-flex shrink-0 items-center gap-2 rounded-lg bg-neutral-950 px-3.5 py-2 text-[0.9rem] font-medium normal-case tracking-normal text-white transition-opacity duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:bg-white dark:text-neutral-950"
      >
        <span className="whitespace-nowrap">
          <span className="sm:hidden">{copied ? 'Copied' : 'Copy link'}</span>
          <span className="hidden sm:inline">{copied ? 'Link copied' : 'Copy live link'}</span>
        </span>
        <span
          aria-hidden
          className="inline-block text-sm transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          ↗
        </span>
      </button>
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-[opacity,transform] duration-300 ease-out ${
          copied ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <p
          className="whitespace-nowrap rounded-lg border border-black/10 bg-white/95 px-4 py-2 text-[0.9rem] font-medium normal-case tracking-normal shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md"
          style={{ color: ACCENT_ORANGE }}
        >
          Link copied to clipboard
        </p>
      </div>
    </>
  );
}

/** `desktopOnly`: phones reach Live preview from the profile header's Preview button instead. */
const TABS: { id: PortfolioTabId; label: string; mobileLabel?: string; live?: boolean; desktopOnly?: boolean }[] = [
  { id: 'information', label: 'Information' },
  { id: 'templates', label: 'Explore templates', mobileLabel: 'Templates' },
  { id: 'preview', label: 'Live preview', live: true, desktopOnly: true },
];

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/** Soft one-shot enter when the workspace panel key changes — no fade-out, no pulse. */
const PANEL_IN_STYLE = {
  animation: `pf-workspace-panel-in 360ms ${EASE} backwards`,
} as const;

/**
 * Centred secondary navbar — a single mineral pill with a sliding white/black plate.
 *
 * Measured from the active button's offset so the plate morphs across unequal label widths
 * without hard-coding four equal columns (which would leave "Explore Templates" cramped and
 * "Information" swimming in empty space).
 */
function PortfolioWorkspaceSegmentedNav({
  tab,
  onTabChange,
  onChangePresence,
}: {
  tab: PortfolioTabId;
  onTabChange: (id: PortfolioTabId) => void;
  onChangePresence: () => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<PortfolioTabId, HTMLButtonElement | null>>({
    information: null,
    templates: null,
    preview: null,
  });
  const [plate, setPlate] = useState({ left: 0, width: 0, ready: false });

  const measure = useCallback(() => {
    const rail = railRef.current;
    const btn = btnRefs.current[tab];
    if (!rail || !btn) return;
    const railBox = rail.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();
    setPlate({
      left: btnBox.left - railBox.left + rail.scrollLeft,
      width: btnBox.width,
      ready: true,
    });
  }, [tab]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    rail.addEventListener('scroll', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      rail.removeEventListener('scroll', onResize);
    };
  }, [measure]);

  return (
    <div className="flex min-w-0 justify-start">
      <div
        ref={railRef}
        role="tablist"
        aria-label="Portfolio workspace"
        /* `rounded-lg` matches DashboardHeaderSearch fluid field — not a full pill. */
        className="pf-scrollbar-hide relative inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-black/[0.1] bg-transparent p-1 dark:border-white/[0.12]"
      >
        {/* Sliding plate — compositor-only transform/size via left+width transitions. */}
        <span
          aria-hidden
          style={{
            left: plate.left,
            width: plate.width,
            transitionTimingFunction: EASE,
            opacity: plate.ready && plate.width > 0 ? 1 : 0,
          }}
          /* Same colour as the page behind it (no grey), set apart by a hairline ring. */
          className="pointer-events-none absolute top-1 bottom-1 rounded-md bg-white ring-1 ring-black/[0.12] transition-[left,width,opacity] duration-[420ms] dark:bg-black dark:ring-white/[0.18]"
        />

        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              ref={(node) => {
                btnRefs.current[item.id] = node;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(item.id)}
              className={`relative z-[1] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-2 text-[0.9rem] font-medium normal-case tracking-normal transition-colors duration-[320ms] ${EASE_CLS} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 sm:px-4 ${
                item.desktopOnly ? 'hidden sm:inline-flex' : 'inline-flex'
              } ${active ? NAV_ACTIVE : NAV_IDLE}`}
            >
              {item.mobileLabel ? (
                <>
                  <span className="sm:hidden">{item.mobileLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </>
              ) : (
                <span>{item.label}</span>
              )}
              {item.live ? (
                <span
                  aria-hidden
                  style={{ backgroundColor: ACCENT_ORANGE }}
                  className="block h-1.5 w-1.5 shrink-0 rounded-full"
                />
              ) : null}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onChangePresence}
          aria-label="Switch format"
          title="Switch format"
          className={`relative z-[1] inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-3 py-2 text-[0.9rem] font-medium normal-case tracking-normal transition-colors duration-[320ms] ${EASE_CLS} ${NAV_IDLE} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 sm:px-4`}
        >
          <FontAwesomeIcon icon={faRightLeft} className="h-[15px] w-[15px] sm:hidden" fixedWidth aria-hidden />
          <span className="hidden sm:inline">Switch format</span>
        </button>
      </div>
    </div>
  );
}

export function MyPortfolioWorkspace() {
  const { user, hasRole, isLoading } = useAuth();
  const [tab, setTab] = useState<PortfolioTabId>('information');
  const [presenceKind, setPresenceKind] = useState<PortfolioPresenceKind | null>(null);
  const selectedPresence = getPortfolioPresenceOption(presenceKind);

  const isCreator = hasRole('ROLE_CREATOR');
  const workspaceNavRef = useRef<HTMLDivElement>(null);
  const isPreview = tab === 'preview';

  useEffect(() => {
    const node = workspaceNavRef.current;
    if (!node) return;
    const publish = () => {
      document.documentElement.style.setProperty(
        '--portfolio-workspace-nav-h',
        `${Math.round(node.getBoundingClientRect().height)}px`
      );
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--portfolio-workspace-nav-h');
    };
  }, [presenceKind, tab]);

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
      <div className={PORTFOLIO_FRAME_CLASS}>
        <div className={`rounded-lg border border-black/[0.08] bg-[#FFFFFF] px-6 py-16 text-center text-sm text-[#666666] dark:border-white/[0.06] dark:bg-[#0F0F0F] dark:text-neutral-400`}>
          Loading…
        </div>
      </div>
    );
  }

  if (!isCreator || !user) {
    return (
      <div className={`mx-4 rounded-2xl border border-dashed border-black/[0.08] bg-[#FFFFFF] px-6 py-16 text-center dark:border-white/[0.08] dark:bg-[#0D0D0D]/80 sm:mx-5`}>
        <p className="text-sm text-[#666666] dark:text-neutral-400">
          A creator account is required to manage your portfolio.
        </p>
        <Link
          href="/feed"
          className="mt-4 inline-flex text-sm font-medium text-[#EA580C] hover:text-[#F97316]"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!selectedPresence) {
    return (
      <div className={`news-theme ${PORTFOLIO_FRAME_CLASS}`}>
        <PortfolioPresencePicker onSelect={(kind) => void persistPresenceKind(kind)} />
      </div>
    );
  }

  return (
    <div
      className={`flex max-w-full min-w-0 flex-col transition-colors duration-500 ${EASE_CLS} ${
        isPreview
          ? 'gap-1 bg-transparent pb-0 pt-2'
          : 'min-h-[calc(100dvh-5rem)] gap-8 bg-transparent pb-10 pt-3 sm:gap-10 sm:pt-4'
      }`}
    >
      <div
        ref={workspaceNavRef}
        data-portfolio-workspace-nav
        className="relative z-30 max-w-full overflow-x-clip bg-transparent py-3 sm:py-4"
      >
        <div className={`${PORTFOLIO_FRAME_CLASS} flex min-w-0 items-center justify-between gap-4`}>
          <PortfolioWorkspaceSegmentedNav
            tab={tab}
            onTabChange={setTab}
            onChangePresence={resetPresence}
          />
          <div className="flex shrink-0 items-center gap-4">
            {isPreview ? <CopyLiveLinkHero shareUrl={buildCreatorPortfolioUrl(user.id, user.username)} /> : null}
            <h1 className="hidden whitespace-nowrap text-lg font-semibold tracking-[-0.01em] text-[#0A0A0A] md:block dark:text-white">
              {PRESENCE_SPACE_TITLES[selectedPresence.id]}
            </h1>
          </div>
        </div>
      </div>

      <div
        className={`min-w-0 flex-1 ${
          /* The News palette stays off the live preview: its settings dock has its own surface system. */
          isPreview ? 'min-h-0 max-w-full overflow-x-clip' : `news-theme ${PORTFOLIO_FRAME_CLASS}`
        }`}
      >
        {/*
          One enter animation only — no fade-out first (that read as a pulse).
          `key` remounts the panel so the soft rise runs once per navigation.
        */}
        <div key={tab} className="pf-workspace-panel-in" style={PANEL_IN_STYLE}>
          {tab === 'information' ? (
            <CreatorStudioProfileTab
              variant="portfolio"
              portfolioNavSide={PORTFOLIO_NAV_SIDE}
              allowedSections={selectedPresence.sections}
              sectionsNavTitle={selectedPresence.title}
              onPortfolioPreview={() => setTab('preview')}
              sectionsNavFooter={(iconsOnly) => <GenerateCvLink iconsOnly={iconsOnly} />}
            />
          ) : tab === 'preview' ? (
            <PortfolioLivePreview creatorId={user.id} username={user.username} />
          ) : (
            <div className={`rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] px-6 py-20 text-center dark:border-white/[0.04] dark:bg-[#0D0D0D]`}>
              <p className="text-base font-semibold text-[#111111] dark:text-white">
                {TABS.find((t) => t.id === tab)?.label}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#666666] dark:text-neutral-400">
                This tab will be available soon. For now, edit your profile content in Information.
              </p>
              <button
                type="button"
                onClick={() => setTab('information')}
                className={`mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white ${brandCtaClass}`}
              >
                Go to Information
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
