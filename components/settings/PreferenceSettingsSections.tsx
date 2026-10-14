'use client';

import Link from 'next/link';
import { useTheme } from '@/components/landing/ThemeProvider';
import { msg } from '@/lib/i18n/config';
import { useT } from '@/lib/i18n/I18nProvider';
import type { MessagePermission, UserSettings } from '@/lib/account-settings-api';
import {
  SECONDARY_BUTTON_CLASS,
  SegmentedControl,
  SettingRow,
  SettingsCard,
  SettingsSectionHeader,
  ToggleRow,
} from './settingsUi';

type PreferenceProps = {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
};

const NOTIFICATION_TOGGLES: { key: keyof UserSettings; label: string; description: string }[] = [
  {
    key: 'notifyMessages',
    label: msg('Messages and invitations'),
    description: msg('When someone invites you to a conversation.'),
  },
  { key: 'notifyComments', label: msg('Comments'), description: msg('When someone comments on your products or work.') },
  { key: 'notifyFollowers', label: msg('New followers'), description: msg('When someone starts following you.') },
  { key: 'notifyProfileVisits', label: msg('Profile visits'), description: msg('When someone views your portfolio.') },
  { key: 'notifySales', label: msg('Sales'), description: msg('When one of your products is purchased.') },
  {
    key: 'notifyFollowingActivity',
    label: msg('Creators you follow'),
    description: msg('New posts, products and updates from people you follow.'),
  },
];

export function NotificationSettingsSection({ settings, onUpdate }: PreferenceProps) {
  const t = useT();
  const allOn = NOTIFICATION_TOGGLES.every(({ key }) => settings[key] === true);

  return (
    <div>
      <SettingsSectionHeader
        title={t('Notifications')}
        description={t('Choose what deserves your attention. Payments, orders and security alerts are always delivered.')}
      />

      <div className="flex flex-col">
        <SettingsCard title={t('Email')}>
          <ToggleRow
            label={t('Email notifications')}
            description={t('Receive a copy of your notifications by email. Account and security emails are always sent.')}
            checked={settings.emailNotifications}
            onChange={(next) => onUpdate({ emailNotifications: next })}
          />
        </SettingsCard>

        <SettingsCard
          title={t('Activity')}
          description={t('Turned-off categories no longer appear in your notification center or inbox.')}
          footer={
            <button
              type="button"
              onClick={() =>
                onUpdate(
                  Object.fromEntries(NOTIFICATION_TOGGLES.map(({ key }) => [key, !allOn])) as unknown as Partial<UserSettings>,
                )
              }
              className={SECONDARY_BUTTON_CLASS}
            >
              {allOn ? t('Turn all off') : t('Turn all on')}
            </button>
          }
        >
          {NOTIFICATION_TOGGLES.map(({ key, label, description }) => (
            <ToggleRow
              key={key}
              label={t(label)}
              description={t(description)}
              checked={settings[key] === true}
              onChange={(next) => onUpdate({ [key]: next } as Partial<UserSettings>)}
            />
          ))}
        </SettingsCard>
      </div>
    </div>
  );
}

const MESSAGE_OPTIONS: { value: MessagePermission; label: string }[] = [
  { value: 'EVERYONE', label: msg('Everyone') },
  { value: 'FOLLOWING', label: msg('People I follow') },
  { value: 'NOBODY', label: msg('No one') },
];

const MESSAGE_HINTS: Record<MessagePermission, string> = {
  EVERYONE: msg('Anyone on Skraft can start a conversation with you.'),
  FOLLOWING: msg('Only creators you follow can start a new conversation.'),
  NOBODY: msg('Nobody can start a new conversation. Existing conversations stay open.'),
};

export function PrivacySettingsSection({ settings, onUpdate }: PreferenceProps) {
  const t = useT();
  return (
    <div>
      <SettingsSectionHeader
        title={t('Privacy')}
        description={t('Decide how visible you are and who can reach you. Changes apply immediately.')}
      />

      <div className="flex flex-col">
        <SettingsCard title={t('Visibility')}>
          <ToggleRow
            label={t('Show online status')}
            description={t('Let others see when you are active. When off, you also appear offline in conversations.')}
            checked={settings.showOnlineStatus}
            onChange={(next) => onUpdate({ showOnlineStatus: next })}
          />
          <ToggleRow
            label={t('Browse profiles privately')}
            description={t('Your visits are counted anonymously and creators are not notified that you viewed their portfolio.')}
            checked={settings.privateProfileViews}
            onChange={(next) => onUpdate({ privateProfileViews: next })}
          />
        </SettingsCard>

        <SettingsCard title={t('Messages')}>
          <SettingRow label={t('Who can message you')} description={t(MESSAGE_HINTS[settings.messagePermission])} stacked>
            <SegmentedControl
              label={t('Who can message you')}
              value={settings.messagePermission}
              options={MESSAGE_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
              onChange={(next) => onUpdate({ messagePermission: next })}
            />
          </SettingRow>
        </SettingsCard>

        <SettingsCard>
          <SettingRow
            label={t('Profile information')}
            description={t('Choose which details — contact, location, languages — are visible on your public portfolio.')}
          >
            <Link href="/profile" className={SECONDARY_BUTTON_CLASS}>
              {t('Manage in studio')}
            </Link>
          </SettingRow>
        </SettingsCard>
      </div>
    </div>
  );
}

function ThemePreview({ dark }: { dark: boolean }) {
  return (
    <div
      aria-hidden
      className={`flex h-24 w-full flex-col gap-2 p-3 ${dark ? 'bg-[#000000]' : 'bg-[#FFFFFF] shadow-[inset_0_0_0_1px_#EFF3F4]'}`}
    >
      <div className={`h-2.5 w-1/3 rounded-full ${dark ? 'bg-[#E7E9EA]/30' : 'bg-[#0F1419]/20'}`} />
      <div className={`flex flex-1 gap-2 p-2 ${dark ? 'bg-[#16181C]' : 'bg-[#F7F9F9]'}`}>
        <div className={`h-full w-6 rounded-full ${dark ? 'bg-[#E7E9EA]/20' : 'bg-[#0F1419]/10'}`} />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className={`h-2 w-4/5 rounded-full ${dark ? 'bg-[#E7E9EA]/25' : 'bg-[#0F1419]/15'}`} />
          <div className={`h-2 w-3/5 rounded-full ${dark ? 'bg-[#E7E9EA]/12' : 'bg-[#0F1419]/[0.07]'}`} />
        </div>
      </div>
    </div>
  );
}

export function AppearanceSettingsSection() {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const options = [
    { value: 'light' as const, label: t('Light'), description: t('Bright and crisp') },
    { value: 'dark' as const, label: t('Dark'), description: t('Easy on the eyes') },
  ];

  return (
    <div>
      <SettingsSectionHeader
        title={t('Appearance')}
        description={t('Pick the look that suits your workspace. Saved on this device.')}
      />

      <SettingsCard title={t('Theme')}>
        <div role="radiogroup" aria-label={t('Theme')} className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:gap-4 sm:px-0">
          {options.map((option) => {
            const active = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(option.value)}
                data-pf-no-color-transition
                className={`flex flex-col gap-3 bg-[color:var(--gn-field)] p-3 text-start transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
                  active ? 'shadow-[inset_0_0_0_2px_var(--gn-ink)]' : 'hover:shadow-[inset_0_0_0_1px_var(--gn-ink3)]'
                }`}
              >
                <ThemePreview dark={option.value === 'dark'} />
                <span className="flex items-center justify-between px-1 pb-1">
                  <span>
                    <span
                      className={`block text-[15px] leading-5 text-[color:var(--gn-ink)] ${active ? 'font-bold' : 'font-medium'}`}
                    >
                      {t(option.label)}
                    </span>
                    <span className="block text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{t(option.description)}</span>
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      active ? 'border-[color:var(--gn-ink)]' : 'border-[#CFD9DE] dark:border-[#536471]'
                    }`}
                  >
                    {active ? <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--gn-ink)]" /> : null}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
