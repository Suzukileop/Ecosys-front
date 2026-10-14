import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('Settings & privacy') };
}

export default function DashboardSettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
