'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faLanguage } from '@fortawesome/free-solid-svg-icons';
import {
  faBell,
  faBookmark,
  faCircleUser,
  faEye,
  faHardDrive,
  faIdBadge,
  faSun,
} from '@fortawesome/free-regular-svg-icons';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { getApiErrorMessage } from '@/lib/api-error';
import { msg } from '@/lib/i18n/config';
import { useT } from '@/lib/i18n/I18nProvider';
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
import { LanguageSettingsSection } from './LanguageSettingsSection';
import {
  AppearanceSettingsSection,
  NotificationSettingsSection,
  PrivacySettingsSection,
} from './PreferenceSettingsSections';
import { SavedPostsSettingsSection } from './SavedPostsSettingsSection';
import { SecuritySettingsSection } from './SecuritySettingsSection';
import { SECONDARY_BUTTON_CLASS, SETTINGS_SECTION_CLASS, Spinner } from './settingsUi';

type SectionId = 'account' | 'saved' | 'security' | 'notifications' | 'privacy' | 'appearance' | 'language' | 'data';

const SECTIONS: { id: SectionId; label: string; icon: IconDefinition }[] = [
  { id: 'account', label: msg('Account'), icon: faCircleUser },
  { id: 'saved', label: msg('Saved posts'), icon: faBookmark },
  { id: 'security', label: msg('Security'), icon: faIdBadge },
  { id: 'notifications', label: msg('Notifications'), icon: faBell },
  { id: 'privacy', label: msg('Privacy'), icon: faEye },
  { id: 'appearance', label: msg('Appearance'), icon: faSun },
  { id: 'language', label: msg('Language'), icon: faLanguage },
  { id: 'data', label: msg('Your data'), icon: faHardDrive },
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
      data-pf-no-color-transition
      className={`relative flex min-h-11 w-full items-center gap-3 px-6 py-3.5 text-start text-[15px] leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] ${
        active ? 'font-bold' : 'font-normal'
      }`}
    >
      {/* The open section: a 2px ink bar on the box's left edge, as in My Profile's "Manage" rail. */}
      {active ? <span aria-hidden className="absolute inset-y-2 start-0 w-[2px] rounded-full bg-[color:var(--gn-ink)]" /> : null}
      <FontAwesomeIcon
        icon={icon}
        className={`h-4 w-4 shrink-0 ${active ? 'text-[color:var(--gn-ink)]' : 'text-[color:var(--gn-ink2)]'}`}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const t = useT();
  if (state === 'idle') return null;
  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-1.5 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]"
    >
      {state === 'saving' ? (
        <>
          <Spinner className="h-3.5 w-3.5" />
          {t('Saving…')}
        </>
      ) : state === 'saved' ? (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
          {t('All changes saved')}
        </>
      ) : (
        <>
          <span className="text-[#F4212E]">{t('Not saved')}</span>
        </>
      )}
    </span>
  );
}

function SectionSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="mx-4 h-8 w-48 bg-[color:var(--gn-surface)] sm:mx-0" />
      <div className="mx-4 mt-3 h-4 w-80 max-w-full bg-[color:var(--gn-surface)] sm:mx-0" />
      <div className={`mt-6 ${SETTINGS_SECTION_CLASS} lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12`}>
        <div className="mx-4 h-5 w-36 bg-[color:var(--gn-surface)] sm:mx-0" />
        <div className="mt-4 flex flex-col gap-4 px-4 sm:px-0 lg:mt-0">
          <div className="h-11 rounded-md bg-[color:var(--gn-surface)]" />
          <div className="h-11 rounded-md bg-[color:var(--gn-surface)]" />
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const t = useT();
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
      setLoadError(getApiErrorMessage(error, t('We could not load your settings.')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, [load]);

  const selectSection = (id: SectionId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('collection');
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
          title: t('Setting not saved'),
          description: getApiErrorMessage(error, t('Please try again.')),
        });
      }
    },
    [t],
  );

  const renderSection = () => {
    if (active === 'appearance') return <AppearanceSettingsSection />;
    if (active === 'language') return <LanguageSettingsSection />;
    if (active === 'account') return <AccountSettingsSection security={security} />;
    if (active === 'saved') return <SavedPostsSettingsSection />;
    if (loading) return <SectionSkeleton />;
    if (loadError) {
      return (
        <div className={`${SETTINGS_SECTION_CLASS} flex flex-col items-start gap-4 px-4 sm:px-0`}>
          <div>
            <p className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">{t('Settings unavailable')}</p>
            <p className="mt-1 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{loadError}</p>
          </div>
          <button type="button" onClick={() => void load()} className={SECONDARY_BUTTON_CLASS}>
            {t('Try again')}
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

  /* The navbar's frame (1240px inside 32 / 48 / 64px gutters — NAVBAR_FRAME_CLASS), like News and My
     Profile, so the page's edges sit under the wordmark and the avatar. The rail is My Profile's 20rem
     "Manage" box, mirrored to the left (settings navigation leads), 48px from the section column, which
     takes the rest of the frame. Sections sit on the page, split by hairlines (SettingsCard); on phones
     the rail becomes a scrollable tab row. */
  return (
    <div className="news-theme news-feed news-mono mx-auto w-full max-w-[1368px] pb-24 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16">
      <div className="px-4 pb-1 pt-1 md:hidden">
        <h1 className="text-[22px] font-extrabold leading-7 tracking-[-0.01em] text-[color:var(--gn-ink)]">
          {t('Settings & privacy')}
        </h1>
      </div>

      <nav
        aria-label={t('Settings sections')}
        className="mb-4 flex overflow-x-auto px-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => selectSection(section.id)}
              aria-current={isActive ? 'page' : undefined}
              data-pf-no-color-transition
              className={`relative min-h-11 shrink-0 px-3 text-[15px] leading-5 transition-colors ${
                isActive ? 'font-bold text-[color:var(--gn-ink)]' : 'font-medium text-[color:var(--gn-ink2)]'
              }`}
            >
              {t(section.label)}
              {isActive ? (
                <span aria-hidden className="absolute inset-x-3 bottom-0 h-1 rounded-full bg-[color:var(--gn-ink)]" />
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="grid items-start gap-8 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)] xl:gap-12">
        <ProfileSectionStickyAside className="hidden w-full md:block" surfaceClassName="flex w-full max-w-full min-w-0 flex-col">
          <div className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5">
            <h1 className="px-6 pb-2 pt-1 text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">
              {t('Settings')}
            </h1>
            <nav aria-label={t('Settings sections')} className="flex flex-col">
              {SECTIONS.map((section) => (
                <SettingsNavItem
                  key={section.id}
                  label={t(section.label)}
                  icon={section.icon}
                  active={section.id === active}
                  onClick={() => selectSection(section.id)}
                />
              ))}
            </nav>
          </div>
        </ProfileSectionStickyAside>

        <div className="min-w-0">
          {saveState !== 'idle' ? (
            <div className="mb-2 flex h-5 justify-end px-4 sm:px-0">
              <SaveIndicator state={saveState} />
            </div>
          ) : null}
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
