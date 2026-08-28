'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faGear } from '@fortawesome/free-solid-svg-icons';
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
import { buildCreatorPortfolioPath, buildCreatorPortfolioUrl } from '@/lib/portfolio-url';
import { brandCtaClass } from '@/components/landing/landingBrand';

type PortfolioTabId = 'information' | 'templates' | 'showcases' | 'preview';
type PortfolioNavSide = 'left' | 'right';

const TABS: { id: PortfolioTabId; label: string; live?: boolean }[] = [
  { id: 'information', label: 'Information' },
  { id: 'templates', label: 'Explore Templates' },
  { id: 'showcases', label: 'Showcases' },
  { id: 'preview', label: 'Live Preview', live: true },
];

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function displayHost(url: string): string {
  try {
    const u = new URL(url);
    return `://${u.host}`;
  } catch {
    return '://noprobleme.com';
  }
}

function PortfolioLivePreview({
  creatorId,
  username,
}: {
  creatorId: string;
  username?: string | null;
}) {
  const [frameKey, setFrameKey] = useState(0);
  const path = buildCreatorPortfolioPath(creatorId, username);
  const absoluteUrl = buildCreatorPortfolioUrl(creatorId, username);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Live Preview</p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{absoluteUrl}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setFrameKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <RefreshIcon className="h-3.5 w-3.5" />
            Refresh
          </button>
          <a
            href={path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-neutral-200"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            Open
          </a>
        </div>
      </div>
      <div className="relative h-[min(78vh,920px)] w-full bg-white dark:bg-neutral-950">
        <iframe
          key={frameKey}
          title="Portfolio live preview"
          src={path}
          className="absolute inset-0 h-full w-full border-0 bg-white"
        />
      </div>
    </div>
  );
}

function PortfolioInformationSettings({
  navSide,
  onToggleNavSide,
  onChangePresence,
}: {
  navSide: PortfolioNavSide;
  onToggleNavSide: () => void;
  onChangePresence: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const moveSideLabel =
    navSide === 'left' ? 'Move sidebar to the right' : 'Move sidebar to the left';

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title="Information settings"
        aria-label="Information settings"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
          open
            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-white dark:ring-neutral-700'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-800'
        }`}
      >
        <FontAwesomeIcon icon={faGear} className="h-4 w-4" fixedWidth />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Information settings"
          className="absolute right-0 top-full z-40 mt-1.5 min-w-[12.5rem] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
            Settings
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onChangePresence();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <span className="min-w-0 flex-1">Choose another presence</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onToggleNavSide();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <FontAwesomeIcon
              icon={navSide === 'left' ? faArrowRight : faArrowLeft}
              className="h-3.5 w-3.5 shrink-0 text-neutral-400"
              fixedWidth
            />
            <span className="min-w-0 flex-1">{moveSideLabel}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MyPortfolioWorkspace() {
  const { user, hasRole, isLoading } = useAuth();
  const [tab, setTab] = useState<PortfolioTabId>('information');
  const [copied, setCopied] = useState(false);
  const [portfolioNavSide, setPortfolioNavSide] = useState<PortfolioNavSide>('left');
  const [presenceKind, setPresenceKind] = useState<PortfolioPresenceKind | null>(null);
  const selectedPresence = getPortfolioPresenceOption(presenceKind);

  const isCreator = hasRole('ROLE_CREATOR');
  const shareUrl = useMemo(
    () => (user?.id ? buildCreatorPortfolioUrl(user.id, user.username) : ''),
    [user?.id, user?.username]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setPortfolioNavSide(
        window.localStorage.getItem('portfolio-sections-nav-side') === 'right' ? 'right' : 'left'
      );
    } catch {
      /* ignore */
    }
  }, []);

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

  const togglePortfolioNavSide = useCallback(() => {
    setPortfolioNavSide((prev) => {
      const next = prev === 'left' ? 'right' : 'left';
      try {
        window.localStorage.setItem('portfolio-sections-nav-side', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const onCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
        Loading…
      </div>
    );
  }

  if (!isCreator || !user) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          A creator account is required to manage your portfolio.
        </p>
        <Link href="/dashboard/home" className="mt-4 inline-flex text-sm font-medium text-[#EA580C] hover:text-[#F97316]">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Portfolio workspace">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-white dark:ring-neutral-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                {item.live ? <EyeIcon className="h-4 w-4" /> : null}
                <span>{item.label}</span>
                {item.live ? (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F97316] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F97316]" />
                  </span>
                ) : null}
              </button>
            );
          })}
          {tab === 'information' && selectedPresence ? (
            <>
              <button
                type="button"
                onClick={() => setPresenceKind(null)}
                className="inline-flex items-center rounded-xl bg-neutral-100 px-3 py-2.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-200/80 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Change presence
              </button>
              <PortfolioInformationSettings
                navSide={portfolioNavSide}
                onToggleNavSide={togglePortfolioNavSide}
                onChangePresence={() => setPresenceKind(null)}
              />
            </>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
            <span className="truncate font-medium">{displayHost(shareUrl)}</span>
          </div>
          <button
            type="button"
            onClick={() => void onCopy()}
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-neutral-200"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* Tab panels */}
      {tab === 'information' ? (
        selectedPresence ? (
          <CreatorStudioProfileTab
            variant="portfolio"
            portfolioNavSide={portfolioNavSide}
            allowedSections={selectedPresence.sections}
            sectionsNavTitle={selectedPresence.title}
          />
        ) : (
          <PortfolioPresencePicker onSelect={(kind) => void persistPresenceKind(kind)} />
        )
      ) : tab === 'preview' ? (
        <PortfolioLivePreview creatorId={user.id} username={user.username} />
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-20 text-center dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            {TABS.find((t) => t.id === tab)?.label}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
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
  );
}
