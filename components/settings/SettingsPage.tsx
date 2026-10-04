'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBell, faCircleUser, faEye, faHardDrive, faIdBadge, faSun } from '@fortawesome/free-regular-svg-icons';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { PORTFOLIO_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  getAccountSecurity,
  getUserSettings,
  updateUserSettings,
  type AccountSecurity,
  type UserSettings,
} from '@/lib/account-settings-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { AccountSettingsSection } from './AccountSettingsSection';
import { DataSettingsSection } from './DataSettingsSection';
import {
  AppearanceSettingsSection,
  NotificationSettingsSection,
  PrivacySettingsSection,
} from './PreferenceSettingsSections';
import { SecuritySettingsSection } from './SecuritySettingsSection';
import { SECONDARY_BUTTON_CLASS, SETTINGS_CARD_CLASS, Spinner } from './settingsUi';

type SectionId = 'account' | 'security' | 'notifications' | 'privacy' | 'appearance' | 'data';

const SECTIONS: { id: SectionId; label: string; icon: IconDefinition }[] = [
  { id: 'account', label: 'Account', icon: faCircleUser },
  { id: 'security', label: 'Security', icon: faIdBadge },
  { id: 'notifications', label: 'Notifications', icon: faBell },
  { id: 'privacy', label: 'Privacy', icon: faEye },
  { id: 'appearance', label: 'Appearance', icon: faSun },
  { id: 'data', label: 'Your data', icon: faHardDrive },
];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function isSectionId(value: string | null): value is SectionId {
  return SECTIONS.some((section) => section.id === value);
}

function SettingsNavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: IconDefinition;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-[3.25rem] w-full items-center gap-3.5 rounded-lg px-3 py-3.5 text-left text-[16px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
        active
          ? 'font-medium text-[#FF5722]'
          : 'font-normal text-[#222222] hover:bg-black/[0.03] hover:text-[#0A0A0A] dark:text-neutral-300 dark:hover:bg-white/[0.05] dark:hover:text-white'
      }`}
    >
      <FontAwesomeIcon
        icon={icon}
        className={`h-[1.05rem] w-[1.05rem] shrink-0 ${active ? '' : 'text-[#555555] dark:text-neutral-400'}`}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null;
  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-2 text-[13px] text-[#666666] dark:text-neutral-400"
    >
      {state === 'saving' ? (
        <>
          <Spinner className="h-3.5 w-3.5" />
          Saving…
        </>
      ) : state === 'saved' ? (
        <>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          All changes saved
        </>
      ) : (
        <>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Not saved
        </>
      )}
    </span>
  );
}

function SectionSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="h-8 w-48 rounded-md bg-black/[0.06] dark:bg-white/[0.08]" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-black/[0.05] dark:bg-white/[0.06]" />
      <div className={`mt-8 h-72 ${SETTINGS_CARD_CLASS}`} />
    </div>
  );
}

export function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get('section');
  const active: SectionId = isSectionId(requested) ? requested : 'account';

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [security, setSecurity] = useState<AccountSecurity | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const settingsRef = useRef<UserSettings | null>(null);
  const pendingRef = useRef(0);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [nextSettings, nextSecurity] = await Promise.all([getUserSettings(), getAccountSecurity()]);
      settingsRef.current = nextSettings;
      setSettings(nextSettings);
      setSecurity(nextSecurity);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'We could not load your settings.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, [load]);

  const selectSection = (id: SectionId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'account') params.delete('section');
    else params.set('section', id);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = useCallback(
    async (patch: Partial<UserSettings>) => {
      const previous = settingsRef.current;
      if (!previous) return;
      const next = { ...previous, ...patch };
      settingsRef.current = next;
      setSettings(next);
      pendingRef.current += 1;
      setSaveState('saving');
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      try {
        await updateUserSettings(patch);
        pendingRef.current -= 1;
        if (pendingRef.current === 0) {
          setSaveState('saved');
          savedTimerRef.current = setTimeout(() => setSaveState('idle'), 2400);
        }
      } catch (error) {
        pendingRef.current -= 1;
        const current = settingsRef.current;
        if (current) {
          const reverted = { ...current };
          for (const key of Object.keys(patch) as (keyof UserSettings)[]) {
            (reverted as Record<string, unknown>)[key] = previous[key];
          }
          settingsRef.current = reverted;
          setSettings(reverted);
        }
        setSaveState('error');
        pushFlashFeedback({
          variant: 'error',
          title: 'Setting not saved',
          description: getApiErrorMessage(error, 'Please try again.'),
        });
      }
    },
    [],
  );

  const renderSection = () => {
    if (active === 'appearance') return <AppearanceSettingsSection />;
    if (active === 'account') return <AccountSettingsSection security={security} />;
    if (loading) return <SectionSkeleton />;
    if (loadError) {
      return (
        <div className={`${SETTINGS_CARD_CLASS} flex flex-col items-start gap-4 px-6 py-8`}>
          <div>
            <p className="text-[16px] font-semibold text-[#111111] dark:text-white">Settings unavailable</p>
            <p className="mt-1 text-[14px] text-[#666666] dark:text-neutral-400">{loadError}</p>
          </div>
          <button type="button" onClick={() => void load()} className={SECONDARY_BUTTON_CLASS}>
            Try again
          </button>
        </div>
      );
    }
    if (active === 'security') return <SecuritySettingsSection security={security} onSecurityChange={setSecurity} />;
    if (active === 'data') return <DataSettingsSection security={security} />;
    if (!settings) return null;
    if (active === 'notifications') {
      return <NotificationSettingsSection settings={settings} onUpdate={(patch) => void handleUpdate(patch)} />;
    }
    return <PrivacySettingsSection settings={settings} onUpdate={(patch) => void handleUpdate(patch)} />;
  };

  return (
    <div className={`${PORTFOLIO_FRAME_CLASS} pb-20 pt-4`}>
      <div className="mb-8 flex items-end justify-between gap-4 md:hidden">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white">
          Settings &amp; privacy
        </h1>
      </div>

      <nav
        aria-label="Settings sections"
        className="-mx-4 mb-8 flex gap-1 overflow-x-auto border-b border-black/[0.06] px-4 [scrollbar-width:none] md:hidden dark:border-white/[0.08] [&::-webkit-scrollbar]:hidden"
      >
        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => selectSection(section.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative shrink-0 px-3 pb-3 pt-1 text-[15px] transition-colors ${
                isActive ? 'font-medium text-[#FF5722]' : 'text-[#444444] dark:text-neutral-400'
              }`}
            >
              {section.label}
              {isActive ? <span aria-hidden className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#FF5722]" /> : null}
            </button>
          );
        })}
      </nav>

      <div className="grid gap-10 md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-16">
        <ProfileSectionStickyAside className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-black/10 bg-white dark:border-0 dark:bg-white/[0.06]">
            <div className="flex h-14 shrink-0 items-center border-b border-black/[0.05] px-5 dark:border-white/[0.05]">
              <h1 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-neutral-500">
                Settings &amp; privacy
              </h1>
            </div>
            <nav aria-label="Settings sections" className="flex flex-col gap-2 px-2.5 pb-3 pt-3">
              {SECTIONS.map((section) => (
                <SettingsNavItem
                  key={section.id}
                  label={section.label}
                  icon={section.icon}
                  active={section.id === active}
                  onClick={() => selectSection(section.id)}
                />
              ))}
            </nav>
          </div>
        </ProfileSectionStickyAside>

        <div className="min-w-0 max-w-3xl">
          <div className="mb-2 flex h-5 justify-end">
            <SaveIndicator state={saveState} />
          </div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
