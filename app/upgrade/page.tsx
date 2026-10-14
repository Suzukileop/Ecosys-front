import type { Metadata } from 'next';
import { PricingUpgradePage } from '@/components/portfolio/portfolio-pricing-upgrade-panel';
import { msg } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: msg('Pricing — Upgrade'),
  description: msg('Choose the plan that fits your ambitions: Free, Pro, Enterprise, or Premium.'),
  robots: { index: false, follow: false },
};

export default function UpgradePage() {
  return <PricingUpgradePage />;
}
