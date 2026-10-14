'use client';

import { LOCALE_NAMES, LOCALES, localeDir } from '@/lib/i18n/config';
import { useLocale, useT } from '@/lib/i18n/I18nProvider';
import { SettingsCard, SettingsSectionHeader, Spinner } from './settingsUi';

/** Settings › Language: one tile per language, each under its own name (what a reader looks for). */
export function LanguageSettingsSection() {
  const t = useT();
  const { locale, setLocale, switching } = useLocale();

  return (
    <div>
      <SettingsSectionHeader
        title={t('Language')}
        description={t('Choose the language of the whole interface. Saved on this device.')}
      />

      <SettingsCard
        title={t('Display language')}
        description={t('Menus, buttons and messages switch at once. What people write stays as they wrote it.')}
      >
        <div role="radiogroup" aria-label={t('Display language')} className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:gap-4 sm:px-0">
          {LOCALES.map((option) => {
            const active = option === locale;
            const names = LOCALE_NAMES[option];
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={active}
                lang={option}
                onClick={() => setLocale(option)}
                data-pf-no-color-transition
                className={`flex min-h-16 items-center justify-between gap-3 bg-[color:var(--gn-field)] px-4 py-3 text-start transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
                  active ? 'shadow-[inset_0_0_0_2px_var(--gn-ink)]' : 'hover:shadow-[inset_0_0_0_1px_var(--gn-ink3)]'
                }`}
              >
                <span className="min-w-0">
                  <span
                    dir={localeDir(option)}
                    className={`block text-[15px] leading-5 text-[color:var(--gn-ink)] ${active ? 'font-bold' : 'font-medium'}`}
                  >
                    {names.native}
                  </span>
                  {/* The language's name in the current interface language, for a reader who can't read the other script. */}
                  <span lang={locale} className="block text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
                    {t(names.english)}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? 'border-[color:var(--gn-ink)]' : 'border-[#CFD9DE] dark:border-[#536471]'
                  }`}
                >
                  {active ? (
                    switching ? <Spinner className="h-3 w-3" /> : <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--gn-ink)]" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
