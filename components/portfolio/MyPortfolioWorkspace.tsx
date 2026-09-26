'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ACCENT_ORANGE } from '@/components/landing/landingBrand';
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
import { brandCtaClass } from '@/components/landing/landingBrand';
import { PortfolioLivePreview } from '@/components/portfolio/PortfolioLivePreview';

type PortfolioTabId = 'information' | 'templates' | 'preview';
type PortfolioNavSide = 'left' | 'right';

const TABS: { id: PortfolioTabId; label: string; live?: boolean }[] = [
  { id: 'information', label: 'Information' },
  { id: 'templates', label: 'Explore Templates' },
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
  const [portfolioNavSide, setPortfolioNavSide] = useState<PortfolioNavSide>('left');
  const [presenceKind, setPresenceKind] = useState<PortfolioPresenceKind | null>(null);
  const selectedPresence = getPortfolioPresenceOption(presenceKind);

  const isCreator = hasRole('ROLE_CREATOR');

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

  if (isLoading) {
    return (
      <div className="mx-4 rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 sm:mx-5">
        Loading…
      </div>
    );
  }

  if (!isCreator || !user) {
    return (
      <div className="mx-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/40 sm:mx-5">
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
      {/*
       * The workspace chrome only exists once there is a workspace. Until a presence is picked
       * there is nothing to be on the Information tab *of*, no template to explore and nothing to
       * preview — so the strip stays out and "Build your vision" is the whole screen. It also
       * keeps the state machine honest: these tabs are the only way to leave the Information
       * panel, so they cannot be reachable in a state where leaving it leads nowhere.
       */}
      {selectedPresence ? (
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5">
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
                /* Pills rather than slabs: thin, fully rounded, translucent, with a hairline that
                   firms up on the selected one. No filled white plate and no shadow — this strip
                   sits directly under a glass navbar and a second solid surface right beneath it
                   read as a second navbar. */
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.8rem] font-medium transition-[color,background-color,border-color] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                  active
                    ? 'border-neutral-900/15 bg-neutral-900/[0.06] text-neutral-950 dark:border-white/15 dark:bg-white/10 dark:text-white'
                    : 'border-transparent bg-neutral-900/[0.03] text-neutral-500 hover:text-neutral-900 dark:bg-white/5 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {item.live ? <EyeIcon className="h-3.5 w-3.5 shrink-0" /> : null}
                <span>{item.label}</span>
                {/* A 4px dot, and no ping. The pulse was the loudest thing on the page for a
                    status that never changes. */}
                {item.live ? (
                  <span
                    aria-hidden
                    style={{ backgroundColor: ACCENT_ORANGE }}
                    className={`block h-1 w-1 shrink-0 rounded-full transition-opacity duration-[420ms] ${
                      active ? 'opacity-100' : 'opacity-60'
                    }`}
                  />
                ) : null}
              </button>
            );
          })}
          {tab === 'information' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setPresenceKind(null);
                  setTab('information');
                }}
                className="inline-flex items-center rounded-full border border-transparent bg-neutral-900/[0.03] px-4 py-1.5 text-[0.8rem] font-medium text-neutral-500 transition-colors duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-neutral-900 dark:bg-white/5 dark:text-neutral-400 dark:hover:text-white"
              >
                Change presence
              </button>
              <PortfolioInformationSettings
                navSide={portfolioNavSide}
                onToggleNavSide={togglePortfolioNavSide}
                onChangePresence={() => {
                  setPresenceKind(null);
                  setTab('information');
                }}
              />
            </>
          ) : null}
        </div>
      </div>
      ) : null}

      {/* Tab panels — Live Preview bleeds to the main-column edges; other tabs keep inset. */}
      {!selectedPresence ? (
        <div className="px-4 pb-10 sm:px-5">
          <PortfolioPresencePicker onSelect={(kind) => void persistPresenceKind(kind)} />
        </div>
      ) : tab === 'information' ? (
        <div className="px-4 pb-10 sm:px-5">
          <CreatorStudioProfileTab
            variant="portfolio"
            portfolioNavSide={portfolioNavSide}
            allowedSections={selectedPresence.sections}
            sectionsNavTitle={selectedPresence.title}
          />
        </div>
      ) : tab === 'preview' ? (
        <PortfolioLivePreview creatorId={user.id} username={user.username} />
      ) : (
        <div className="mx-4 mb-10 rounded-2xl border border-neutral-200 bg-white px-6 py-20 text-center dark:border-neutral-800 dark:bg-neutral-950 sm:mx-5">
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
