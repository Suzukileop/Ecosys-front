'use client';

import Link from 'next/link';
import { useTheme } from '@/components/landing/ThemeProvider';
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
    label: 'Messages and invitations',
    description: 'When someone invites you to a conversation.',
  },
  { key: 'notifyComments', label: 'Comments', description: 'When someone comments on your products or work.' },
  { key: 'notifyFollowers', label: 'New followers', description: 'When someone starts following you.' },
  { key: 'notifyProfileVisits', label: 'Profile visits', description: 'When someone views your portfolio.' },
  { key: 'notifySales', label: 'Sales', description: 'When one of your products is purchased.' },
  {
    key: 'notifyFollowingActivity',
    label: 'Creators you follow',
    description: 'New posts, products and updates from people you follow.',
  },
];

export function NotificationSettingsSection({ settings, onUpdate }: PreferenceProps) {
  const allOn = NOTIFICATION_TOGGLES.every(({ key }) => settings[key] === true);

  return (
    <div>
      <SettingsSectionHeader
        title="Notifications"
        description="Choose what deserves your attention. Payments, orders and security alerts are always delivered."
      />

      <div className="flex flex-col gap-6">
        <SettingsCard title="Email">
          <ToggleRow
            label="Email notifications"
            description="Receive a copy of your notifications by email. Account and security emails are always sent."
            checked={settings.emailNotifications}
            onChange={(next) => onUpdate({ emailNotifications: next })}
          />
        </SettingsCard>

        <SettingsCard
          title="Activity"
          description="Turned-off categories no longer appear in your notification center or inbox."
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
              {allOn ? 'Turn all off' : 'Turn all on'}
            </button>
          }
        >
          {NOTIFICATION_TOGGLES.map(({ key, label, description }) => (
            <ToggleRow
              key={key}
              label={label}
              description={description}
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
  { value: 'EVERYONE', label: 'Everyone' },
  { value: 'FOLLOWING', label: 'People I follow' },
  { value: 'NOBODY', label: 'No one' },
];

const MESSAGE_HINTS: Record<MessagePermission, string> = {
  EVERYONE: 'Anyone on Skraft can start a conversation with you.',
  FOLLOWING: 'Only creators you follow can start a new conversation.',
  NOBODY: 'Nobody can start a new conversation. Existing conversations stay open.',
};

export function PrivacySettingsSection({ settings, onUpdate }: PreferenceProps) {
  return (
    <div>
      <SettingsSectionHeader
        title="Privacy"
        description="Decide how visible you are and who can reach you. Changes apply immediately."
      />

      <div className="flex flex-col gap-6">
        <SettingsCard title="Visibility">
          <ToggleRow
            label="Show online status"
            description="Let others see when you are active. When off, you also appear offline in conversations."
            checked={settings.showOnlineStatus}
            onChange={(next) => onUpdate({ showOnlineStatus: next })}
          />
          <ToggleRow
            label="Browse profiles privately"
            description="Your visits are counted anonymously and creators are not notified that you viewed their portfolio."
            checked={settings.privateProfileViews}
            onChange={(next) => onUpdate({ privateProfileViews: next })}
          />
        </SettingsCard>

        <SettingsCard title="Messages">
          <SettingRow label="Who can message you" description={MESSAGE_HINTS[settings.messagePermission]} stacked>
            <SegmentedControl
              label="Who can message you"
              value={settings.messagePermission}
              options={MESSAGE_OPTIONS}
              onChange={(next) => onUpdate({ messagePermission: next })}
            />
          </SettingRow>
        </SettingsCard>

        <SettingsCard>
          <SettingRow
            label="Profile information"
            description="Choose which details — contact, location, languages — are visible on your public portfolio."
          >
            <Link href="/profile" className={SECONDARY_BUTTON_CLASS}>
              Manage in studio
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
      className={`flex h-24 w-full flex-col gap-2 rounded-md p-3 ${dark ? 'bg-black' : 'bg-[#F8F8F8]'}`}
    >
      <div className={`h-2.5 w-1/3 rounded-full ${dark ? 'bg-white/25' : 'bg-black/15'}`} />
      <div className={`flex flex-1 gap-2 rounded ${dark ? 'bg-white/[0.08]' : 'bg-white'} p-2`}>
        <div className={`h-full w-6 rounded ${dark ? 'bg-white/15' : 'bg-black/[0.07]'}`} />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className={`h-2 w-4/5 rounded-full ${dark ? 'bg-white/20' : 'bg-black/10'}`} />
          <div className={`h-2 w-3/5 rounded-full ${dark ? 'bg-white/10' : 'bg-black/[0.06]'}`} />
        </div>
      </div>
    </div>
  );
}

export function AppearanceSettingsSection() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: 'light' as const, label: 'Light', description: 'Bright and crisp' },
    { value: 'dark' as const, label: 'Dark', description: 'Easy on the eyes' },
  ];

  return (
    <div>
      <SettingsSectionHeader title="Appearance" description="Pick the look that suits your workspace. Saved on this device." />

      <SettingsCard title="Theme">
        <div role="radiogroup" aria-label="Theme" className="grid gap-4 px-6 py-6 sm:grid-cols-2">
          {options.map((option) => {
            const active = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(option.value)}
                className={`flex flex-col gap-3 rounded-lg border p-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
                  active
                    ? 'border-[#FF5722]'
                    : 'border-black/10 hover:border-black/25 dark:border-white/10 dark:hover:border-white/25'
                }`}
              >
                <ThemePreview dark={option.value === 'dark'} />
                <span className="flex items-center justify-between px-1 pb-1">
                  <span>
                    <span
                      className={`block text-[15px] font-medium ${active ? 'text-[#FF5722]' : 'text-[#111111] dark:text-white'}`}
                    >
                      {option.label}
                    </span>
                    <span className="block text-[13px] text-[#888888] dark:text-neutral-500">{option.description}</span>
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      active ? 'border-[#FF5722]' : 'border-black/20 dark:border-white/25'
                    }`}
                  >
                    {active ? <span className="h-2.5 w-2.5 rounded-full bg-[#FF5722]" /> : null}
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
