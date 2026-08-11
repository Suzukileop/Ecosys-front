import type { Metadata } from 'next';
import { PricingUpgradePage } from '@/components/portfolio/portfolio-pricing-upgrade-panel';

export const metadata: Metadata = {
  title: 'Pricing — Upgrade',
  description: 'Choose the plan that fits your ambitions: Free, Pro, Enterprise, or Premium.',
  robots: { index: false, follow: false },
};

export default function UpgradePage() {
  return <PricingUpgradePage />;
}
